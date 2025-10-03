"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  User,
  Calendar,
  GraduationCap,
  Star,
  TrendingUp,
  BookOpen,
} from "lucide-react";

interface Student {
  id: string;
  firstName: string;
  lastName?: string;
  gradeLevel: string;
  birthDate?: string;
  isActive: boolean;
  createdAt: string;
  // Mock analytics data
  totalWorksheets: number;
  averageScore: number;
  favoriteSubject: string;
  lastActive: string;
}

interface StudentManagerProps {
  userId: string;
  className?: string;
}

const GRADE_LEVELS = [
  { value: "K", label: "Kindergarten" },
  { value: "1-2", label: "Grades 1-2" },
  { value: "3-4", label: "Grades 3-4" },
  { value: "5-6", label: "Grades 5-6" },
  { value: "7-8", label: "Grades 7-8" },
  { value: "9-12", label: "Grades 9-12" },
];

export function StudentManager({ userId, className }: StudentManagerProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    gradeLevel: "K",
    birthDate: "",
  });

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const mockStudents: Student[] = [
      {
        id: "student-1",
        firstName: "Emma",
        lastName: "Johnson",
        gradeLevel: "3-4",
        birthDate: "2019-05-15",
        isActive: true,
        createdAt: "2024-01-01",
        totalWorksheets: 42,
        averageScore: 92,
        favoriteSubject: "Math",
        lastActive: "2024-01-15",
      },
      {
        id: "student-2",
        firstName: "Liam",
        lastName: "Johnson",
        gradeLevel: "1-2",
        birthDate: "2021-08-22",
        isActive: true,
        createdAt: "2024-01-01",
        totalWorksheets: 28,
        averageScore: 88,
        favoriteSubject: "Science",
        lastActive: "2024-01-14",
      },
    ];
    setStudents(mockStudents);
  }, [userId]);

  const handleAddStudent = () => {
    if (!newStudent.firstName.trim()) return;

    const student: Student = {
      id: `student-${Date.now()}`,
      firstName: newStudent.firstName,
      lastName: newStudent.lastName || undefined,
      gradeLevel: newStudent.gradeLevel,
      birthDate: newStudent.birthDate || undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      totalWorksheets: 0,
      averageScore: 0,
      favoriteSubject: "Math",
      lastActive: new Date().toISOString(),
    };

    setStudents([...students, student]);
    setNewStudent({ firstName: "", lastName: "", gradeLevel: "K", birthDate: "" });
    setIsAddingStudent(false);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
  };

  const handleUpdateStudent = () => {
    if (!editingStudent) return;

    setStudents(
      students.map((s) => (s.id === editingStudent.id ? { ...s, ...editingStudent } : s))
    );
    setEditingStudent(null);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(students.filter((s) => s.id !== studentId));
  };

  const getGradeLabel = (gradeLevel: string) => {
    return GRADE_LEVELS.find((g) => g.value === gradeLevel)?.label || gradeLevel;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className={className}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Student Management</h2>
          <p className="text-gray-600">Manage student accounts and track their progress</p>
        </div>
        <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
          <DialogTrigger asChild>
            <Button className="homeschool-button">
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>Create a new student account for your child</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newStudent.firstName}
                  onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newStudent.lastName}
                  onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Select
                  value={newStudent.gradeLevel}
                  onValueChange={(value) => setNewStudent({ ...newStudent, gradeLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={newStudent.birthDate}
                  onChange={(e) => setNewStudent({ ...newStudent, birthDate: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddStudent} className="homeschool-button">
                  Add Student
                </Button>
                <Button variant="outline" onClick={() => setIsAddingStudent(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {students.map((student) => (
          <Card key={student.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {student.firstName} {student.lastName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {getGradeLabel(student.gradeLevel)}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEditStudent(student)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteStudent(student.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{student.totalWorksheets}</div>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                    <BookOpen className="h-3 w-3" />
                    Worksheets
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{student.averageScore}%</div>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                    <TrendingUp className="h-3 w-3" />
                    Average
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Favorite Subject</span>
                  <Badge variant="outline">{student.favoriteSubject}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Active</span>
                  <span className="text-sm">
                    {new Date(student.lastActive).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // In a real app, this would switch to student mode
                  console.log(`Switch to student: ${student.firstName}`);
                }}
              >
                <User className="mr-2 h-4 w-4" />
                Switch to Student View
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student information</DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editFirstName">First Name *</Label>
                <Input
                  id="editFirstName"
                  value={editingStudent.firstName}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={editingStudent.lastName || ""}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, lastName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editGradeLevel">Grade Level</Label>
                <Select
                  value={editingStudent.gradeLevel}
                  onValueChange={(value) =>
                    setEditingStudent({ ...editingStudent, gradeLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editBirthDate">Birth Date</Label>
                <Input
                  id="editBirthDate"
                  type="date"
                  value={editingStudent.birthDate || ""}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, birthDate: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateStudent} className="homeschool-button">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingStudent(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
