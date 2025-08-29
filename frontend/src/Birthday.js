import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import "./Birthday.css";

export default function WishesPage() {
    const [employees, setEmployees] = useState([]);
    const [todayBirthdays, setTodayBirthdays] = useState([]);
    const [debugInfo, setDebugInfo] = useState({
        tokenStatus: "",
        apiResponse: null,
        filteredBirthdays: [],
        todayDate: "",
        error: null
    });
    const navigate = useNavigate();

    useEffect(() => {
        console.log("🔍 WishesPage mounted");

        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return navigate("/login");

                setDebugInfo(prev => ({ ...prev, tokenStatus: "Token present" }));

                console.log("🌐 Making API request to employees endpoint...");
                const res = await axios.get("http://172.24.109.63:5000/api/employees", {
                    headers: { Authorization: token }
                });

                console.log("✅ API Response:", res.data);
                console.log("📊 Employees count:", res.data.employees?.length || 0);
                setDebugInfo(prev => ({ ...prev, apiResponse: res.data }));

                setEmployees(res.data.employees);

                // Get today's MM-DD
                const today = new Date();
                const todayStr = "08-24"

                console.log("📅 Today's date (Local MM-DD):", todayStr);
                setDebugInfo(prev => ({ ...prev, todayDate: todayStr }));

                // Debug: Show all employee DOBs
                console.log("🎂 All employee birthdays:");
                res.data.employees.forEach(emp => {
                    console.log(
                        `- ${emp.first_name} ${emp.last_name}: ${emp.date_of_birth} -> ${emp.date_of_birth?.slice(5, 10)}`
                    );
                });

                // Match DOB
                const bdays = res.data.employees.filter(
                    emp =>
                        emp.date_of_birth &&
                        emp.date_of_birth.slice(5, 10) === todayStr
                );

                console.log("🎯 Filtered birthdays today:", bdays);
                console.log("🎯 Count:", bdays.length);
                setDebugInfo(prev => ({ ...prev, filteredBirthdays: bdays }));

                setTodayBirthdays(bdays);
            } catch (err) {
                console.error("❌ Error fetching employees", err);
                console.error("Error details:", err.response?.data || err.message);
                setDebugInfo(prev => ({ ...prev, error: err.message }));
            }
        };

        fetchEmployees();
    }, [navigate]);

    const sendWish = async (email, text) => {
        try {
            console.log("📧 Attempting to send Email:");
            console.log("   To:", email);
            console.log("   Message:", text);

            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please login again");
                return navigate("/login");
            }

            const response = await axios.post(
                "http://172.24.109.63:5000/send-email",
                { to: email, subject: "🎂 Happy Birthday!", text },
                { headers: { Authorization: token } }
            );

            console.log("✅ Email sent successfully:", response.data);
            alert(`Wish sent to ${email}`);
        } catch (err) {
            console.error("❌ Failed to send Email:", err);
            console.error("Error status:", err.response?.status);
            console.error("Error data:", err.response?.data);
            console.error("Error details:", err.response?.data?.details || err.message);

            alert(`Failed to send wish: ${err.response?.data?.error || err.message}`);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-100 p-6">
                <h1 className="text-2xl font-bold mb-4">🎉 Birthday Wishes Portal</h1>

                {/* Debug Panel */}
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
                    <h2 className="text-lg font-semibold mb-2">🔍 Debug Information</h2>
                    <div className="text-sm">
                        <p><strong>Token Status:</strong> {debugInfo.tokenStatus}</p>
                        <p><strong>Today's Date (MM-DD):</strong> {debugInfo.todayDate}</p>
                        <p><strong>Total Employees:</strong> {employees.length}</p>
                        <p><strong>Birthdays Today:</strong> {todayBirthdays.length}</p>
                        {debugInfo.error && (
                            <p className="text-red-600"><strong>Error:</strong> {debugInfo.error}</p>
                        )}
                    </div>

                    {debugInfo.filteredBirthdays.length > 0 && (
                        <div className="mt-3">
                            <h3 className="font-semibold">🎯 Filtered Birthdays:</h3>
                            <ul className="list-disc list-inside">
                                {debugInfo.filteredBirthdays.map((emp, index) => (
                                    <li key={index}>
                                        {emp.first_name} {emp.last_name} - {emp.date_of_birth}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {todayBirthdays.length > 0 ? (
                    <div className="bg-white shadow p-4 rounded mb-6">
                        <h2 className="text-xl font-semibold mb-2">Today's Birthdays 🎂</h2>
                        {todayBirthdays.map(emp => (
                            <div
                                key={emp.id}
                                className="flex justify-between items-center border-b py-2"
                            >
                                <span>
                                    {emp.first_name} {emp.last_name} ({emp.email})
                                </span>

                                <button
                                    onClick={() =>
                                        sendWish(emp.email, `Happy Birthday ${emp.first_name}! 🎉`)
                                    }
                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                >
                                    Send Wish
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No birthdays today 🎈</p>
                )}
            </div>
        </Layout>
    );
}
