import { type RouteConfig, index ,route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
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
         

        ] satisfies RouteConfig;
