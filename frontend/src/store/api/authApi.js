import { apiSlice } from "./apiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    getMe: build.query({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
    changePassword: build.mutation({
      query: (body) => ({ url: "/auth/change-password", method: "PUT", body }),
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery, useChangePasswordMutation } =
  authApi;
