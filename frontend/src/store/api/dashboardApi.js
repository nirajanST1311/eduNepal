import { apiSlice } from "./apiSlice";

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getDashboardStats: build.query({
      query: () => "/dashboard/stats",
      providesTags: ["Dashboard"],
    }),
    getSuperadminStats: build.query({
      query: () => "/dashboard/superadmin",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetSuperadminStatsQuery } =
  dashboardApi;
