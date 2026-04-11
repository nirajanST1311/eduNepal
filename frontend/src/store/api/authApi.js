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
    updateProfile: build.mutation({
      query: (body) => ({ url: "/auth/profile", method: "PATCH", body }),
      invalidatesTags: ["Auth"],
    }),
    uploadAvatar: build.mutation({
      query: (formData) => ({
        url: "/auth/profile/avatar",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} = authApi;
