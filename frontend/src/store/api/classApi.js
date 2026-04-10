import { apiSlice } from "./apiSlice";

export const classApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getClasses: build.query({
      query: (params) => ({ url: "/classes", params }),
      providesTags: ["Classes"],
    }),
    createClass: build.mutation({
      query: (body) => ({ url: "/classes", method: "POST", body }),
      invalidatesTags: ["Classes"],
    }),
    updateClass: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/classes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Classes"],
    }),
    deleteClass: build.mutation({
      query: (id) => ({ url: `/classes/${id}`, method: "DELETE" }),
      invalidatesTags: ["Classes"],
    }),
  }),
});

export const {
  useGetClassesQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} = classApi;
