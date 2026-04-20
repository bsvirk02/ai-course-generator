import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import Layout from "../components/Layout"

const AssignGroupCourses = () => {
    const { user, getAccessTokenSilently, isAuthenticated } = useAuth0()
    const [employees, setEmployees] = useState([])
    const [courses, setCourses] = useState([])
    const [selectedMembers, setSelectedMembers] = useState([])
    const [selectedCourse, setSelectedCourse] = useState([])
    const [groupName, setGroupName] = useState("")
    const [deadline, setDeadline] = useState("")
    const navigate = useNavigate()


    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticated) return
            const token = await getAccessTokenSilently()

            const [usersRes, coursesRes] = await Promise.all([
                fetch("http://localhost:8000/api/users/", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch("http://localhost:8000/api/courses/", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ])

            const usersData = await usersRes.json()
            const coursesData = await coursesRes.json()

            setEmployees(usersData.filter((u) => u.role === "employee"))
            setCourses(coursesData)
        }
        fetchData()
    }, [isAuthenticated, getAccessTokenSilently])

    const handleAssign = async () => {
        const token = await getAccessTokenSilently()

        const res = await fetch("http://localhost:8000/api/assign_group_and_courses/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: groupName,
                members: selectedMembers,
                courses: selectedCourse,
                deadline: deadline,
            }),
        })

        if (!res.ok) {
            const errorData = await res.json()
            console.error(errorData)
            alert("Failed to assign group and courses.")
            return
        }

        alert("Group and courses assigned successfully!")
        navigate("/groups")

    }
    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Assign Courses to Groups</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-1 font-semibold">Group Name</label>
                        <input
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            placeholder="e.g., Cultural Awareness Team"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-semibold">Select Employees</label>
                        <div className="border rounded px-3 py-2 max-h-40 overflow-y-auto space-y-2">
                            {employees.map((emp) => (
                                <label key={emp.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        value={emp.id}
                                        checked={selectedMembers.includes(emp.id)}
                                        onChange={(e) => {
                                            const isChecked = e.target.checked
                                            setSelectedMembers((prev) =>
                                                isChecked ? [...prev, emp.id] : prev.filter((id) => id !== emp.id)
                                            )
                                        }}
                                    />
                                    <span>{emp.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-1 font-semibold">Select Courses</label>
                        <div className="border rounded px-3 py-2 max-h-40 overflow-y-auto space-y-2">
                            {courses.map((course) => (
                                <label key={course.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        value={course.id}
                                        checked={selectedCourse.includes(course.id)}
                                        onChange={(e) => {
                                            const isChecked = e.target.checked
                                            setSelectedCourse((prev) =>
                                                isChecked ? [...prev, course.id] : prev.filter((id) => id !== course.id)
                                            )
                                        }}
                                    />
                                    <span>{course.title}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-1 font-semibold">Deadline</label>
                        <input
                            type="datetime-local"
                            className="w-full border rounded px-3 py-2"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                        />
                    </div>
                </div>
                <button
                    onClick={handleAssign}
                    className="mt-6 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Assign Course
                </button>
            </div>
        </Layout>
    )
}

export default AssignGroupCourses