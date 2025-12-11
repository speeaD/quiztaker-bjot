import { DashboardResponse } from "@/types/global";
import { cookies } from "next/headers";

const baseUrl: string = process.env.BACKEND_URL || "http://localhost:5000/api";
const token = (await cookies()).get("auth-token")?.value || "";

export const getDashboardData = async () => {
    const response = await fetch(`${baseUrl}/quiztaker/dashboard`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        cache: "no-store",  
    });
    console.log('Dashboard response status:', response.status);
    const data = await response.json();

    const dashboardData: DashboardResponse = data.quizTaker
    return dashboardData;
}