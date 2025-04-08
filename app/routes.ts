import { type RouteConfig, index ,route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
         route("sign-in/*","routes/sign-in.tsx"),
         route("profile","routes/profile.tsx"),
         route("component","routes/component.tsx"),
         route("sample","routes/sample.tsx"),
         //route("sampletypes","routes/sampletypes.tsx"),
         route("samplesplat/*","routes/samplesplat.tsx"),
         // routes with client loader
         route("users/:pid","routes/users.pid.tsx"),
         route("/users","routes/users.tsx"),
         // routes with server loader 
         route("susers/:pid","routes/susers.pid.tsx"),
         route("/susers","routes/susers.tsx"),
         // posts
         route("/posts","routes/posts.tsx"),
         route("/sposts","routes/sposts.tsx"),
            // openchat
        //route("/chat","routes/chat.tsx"),
        route("chat","routes/chat.tsx"),
        
        // api routes
        route("api/v1/models", "routes/api/v1/models.tsx"),
        route("api/v1/models/:author/:model", "routes/api/v1/models.author.model.tsx"),
        route("api/v1/chat", "routes/api/v1/chat.tsx"),


        ] satisfies RouteConfig;
