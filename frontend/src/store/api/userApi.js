import { apiSlice } from "./apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query({
      query: (params) => ({ url: "/users", params }),
      providesTags: ["Users"],
    }),
    getUser: build.query({
      query: (id) => `/users/${id}`,
      providesTags: (r, e, id) => [{ type: "Users", id }],
    }),
    createUser: build.mutation({
      query: (body) => ({ url: "/users", method: "POST", body }),
      invalidatesTags: ["Users", "Students"],
    }),
    updateUser: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Users", "Students"],
    }),
    deactivateUser: build.mutation({
      query: (id) => ({ url: `/users/${id}/deactivate`, method: "PATCH" }),
      invalidatesTags: ["Users", "Students"],
    }),
    resetUserPassword: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/users/${id}/reset-password`,
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeactivateUserMutation,
  useResetUserPasswordMutation,
} = userApi;
