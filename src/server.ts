import { serve } from "bun";
import { renderFile } from "ejs";
import * as path from "path";
import * as url from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

console.log(`Bun server running on port 3000`);
// serve({
//     port: 3000,
//     async fetch(req) {
//     const url = new URL(req.url);
//     console.log(`Url: ${url.pathname} requested`);
//     if (url.pathname === "/") {
//       const html = await renderFile(path.join(__dirname, "../views/index.ejs"), {
//         message: "Hello from Bun + EJS!"
//       });
//       return new Response(html, { headers: { "Content-Type": "text/html" } });
//     }

//     return new Response("Not found", { status: 404 });
//   }
// });

// src/server.ts
// import { serve } from "bun";
// import { renderFile } from "ejs";
// import * as path from "path";
// import * as url from "url";
import { drizzle } from "drizzle-orm/node-postgres";
import { pool } from "./db";
import { users, posts } from "../drizzle/schema";
import { eq } from "drizzle-orm";



const db = drizzle(pool);
// const __dirname = path.dirname(url.fileURLToPath(import.meta.url));


serve({
  port: Number(process.env.PORT) || 3000,
  async fetch(req) {
    const url = new URL(req.url);

    console.log(`Url: ${url.pathname} requested`);
    if (url.pathname === "/") {
      const html = await renderFile(path.join(__dirname, "../views/index.ejs"), {
        message: "Hello from Bun + EJS!"
      });
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    if (req.method === "GET" && url.pathname === "/new-user") {
      const html = await renderFile(path.join(__dirname, "../views/new-user.ejs"));
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    if (req.method === "POST" && url.pathname === "/users") {
      const form = await req.formData();
      const name = form.get("name")?.toString();
      const email = form.get("email")?.toString();

      if (!name || !email) {
        return new Response("Missing name or email", { status: 400 });
      }

      await db.insert(users).values({ name, email });

      return new Response("✅ User created!", {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Inside fetch handler
    if (req.method === "GET" && url.pathname === "/users") {
    const allUsers = await db.select().from(users);
    const html = await renderFile(path.join(__dirname, "../views/users.ejs"), {
        users: allUsers,
    });
    return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    if (req.method === "POST" && url.pathname.startsWith("/users/") && url.pathname.endsWith("/delete")) {
        const id = url.pathname.split("/")[2];
        if (!id) return new Response("Missing ID", { status: 400 });
    
        await db.delete(users).where(eq(users.id, Number(id)));
    
        return new Response(null, {
        status: 302,
        headers: { Location: "/users" },
        });
    }

    if (req.method === "GET" && url.pathname === "/new-post") {
        const allUsers = await db.select().from(users);
      
        const html = await renderFile(path.join(__dirname, "../views/new-post.ejs"), {
          users: allUsers,
        });
      
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      }

      if (req.method === "POST" && url.pathname === "/posts") {
        const form = await req.formData();
        const title = form.get("title")?.toString();
        const body = form.get("body")?.toString() ?? "";
        const userId = Number(form.get("user_id"));
      
        if (!title || !userId) {
          return new Response("Missing title or user", { status: 400 });
        }
      
        await db.insert(posts).values({
          title,
          body,
          userId,
        });
      
        return new Response(null, {
          status: 302,
          headers: { Location: "/new-post" },
        });
      }

      if (req.method === 'GET' && url.pathname === "/posts") {
        const allPosts = await db.select().from(posts);
        const allPostsWithUsers = await db
          .select({
            id: posts.id,
            title: posts.title,
            body: posts.body,
            createdAt: posts.createdAt,
            user: {
              id: users.id,
              name: users.name,
              email: users.email,
            },
          })
          .from(posts)
          .innerJoin(users, eq(posts.userId, users.id));

        const html = await renderFile(path.join(__dirname, "../views/posts.ejs"), {
          posts: allPostsWithUsers,
        });

        return new Response(html, {
          headers: { "Content-Type": "text/html" }
        })
      }

      if (req.method === "POST" && url.pathname.startsWith("/posts/") && url.pathname.endsWith("/delete")) {
        const id = url.pathname.split("/")[2];
        if (!id) return new Response("Missing ID", { status: 400 });

        await db.delete(posts).where(eq(posts.id, Number(id)));

        return new Response(null, {
          status: 302,
          headers: { Location: "/posts" },
        })
      }

    return new Response("Not found", { status: 404 });
  }
});
