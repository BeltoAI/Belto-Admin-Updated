"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TimeUsageChart from "../components/TimeUsageChart";
import TotalPrompts from "../components/TotalPrompts";
import UpcomingLessons from "../components/UpcomingLessons";
import UploadedFiles from "../components/UploadedFiles";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

const Dashboard = () => {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [allLectures, setAllLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(true);
  const [user, setUser] = useState(null);

  // Check for authentication on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
    
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (tokenValid && !loading) {
      const fetchData = async () => {
        try {
          const classesResponse = await apiClient.get("/api/classes");
          const classesData = classesResponse.data;
          if (Array.isArray(classesData)) {
            setClasses(classesData);
            const lecturesPromises = classesData.map(async (classItem) => {
              try {
                const lecturesResponse = await apiClient.get(
                  `/api/classes/${classItem._id}/lectures`
                );
                return lecturesResponse.data || [];
              } catch (error) {
                return [];
              }
            });
            const lecturesResults = await Promise.all(lecturesPromises);
            const allLecturesData = lecturesResults.flat();
            const lecturesWithClassName = allLecturesData.map((lecture) => {
              const relatedClass = classesData.find(
                (c) => c._id === lecture.classId
              );
              return {
                ...lecture,
                className: relatedClass ? relatedClass.name : "Unknown Class",
              };
            });
            setAllLectures(lecturesWithClassName);
          }
        } catch (error) {
          if (error.response && error.response.status === 401) {
            setTokenValid(false);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            toast.error("Authentication token expired or invalid");
          }
        }
      };
      fetchData();
    }
  }, [tokenValid, loading]);

  // Redirect to login if token is invalid
  useEffect(() => {
    if (!tokenValid) {
      router.push("/login");
    }
  }, [tokenValid, router]);

  if (loading) {
    return (
      <div className="p-4 md:p-8 bg-black min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-black min-h-screen">
      <h1 className="text-white text-xl md:text-2xl font-semibold mb-6">Dashboard</h1>
      {user && (
        <div className="bg-gray-900 p-4 rounded-lg mb-6">
          <p className="text-white">Welcome, {user.name}</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <TimeUsageChart classes={classes} lectures={allLectures} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
          <TotalPrompts user={user} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <UpcomingLessons classes={classes} lectures={allLectures} />
        <UploadedFiles />
      </div>
    </div>
  );
};

export default Dashboard;