import { useEffect, useState, useRef } from "react";
import api from "../utils/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

interface AdminProfileProps {
    onBack: () => void;

}

export default function AdminProfile({ onBack }: AdminProfileProps) {
    const [name, setName] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [profileFile, setProfileFile] = useState<File | null>(null);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/admin/profile");
                setName(res.data?.name || "");
                setEmail(res.data?.email || "");
                setProfileImage(res.data.profile_image);
            } catch (err) {
                console.error("Failed to load admin profile", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChangePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await api.post("/admin/profile/photo", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setProfileImage(res.data.profile_image); // local state
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload image");
        }
    };



    const handleSave = async () => {
        if (!name.trim()) {
            alert("Display name cannot be empty");
            return;
        }

        try {
            setSaving(true);
            await api.put("/admin/profile", { name, email });
            alert("Profile updated successfully");
            onBack();
        } catch (err) {
            console.error(err);
            alert("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

  const API_BASE_URL = import.meta.env.VITE_API_URL;



    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Loading profile...
            </div>
        );
    }

    return (
        <div className="min-h-screen px-6 py-10 text-white bg-[#111827]">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header with Back button */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-white">
                            Admin Profile
                        </h1>
                        <p className="mt-1 text-gray-300">
                            Manage your personal information and admin settings
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={onBack}
                        style={{
                            borderColor: "#374151",
                            color: "white",
                            backgroundColor: "rgba(55,65,81,0.4)",
                        }}
                    >
                        ← Back to Dashboard
                    </Button>
                </div>



                {/* Profile Card */}
                <Card
                    className="border"
                    style={{
                        backgroundColor: "#273244",   // lighter than dashboard
                        borderColor: "#3B475A",
                    }}
                >
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Avatar */}
                        {/* <div className="flex items-center gap-4"> */}
                        {/* Avatar */}
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">
                                Profile Photo
                            </label>

                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                                    {profileImage ? (
                                        <img
                                            src={`${API_BASE_URL}${profileImage}`}

                                            alt="Profile"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-white text-lg font-semibold">
                                            {name?.charAt(0).toUpperCase() || "A"}
                                        </span>
                                    )}
                                </div>


                                <Button
                                    variant="outline"
                                    onClick={handleChangePhotoClick}
                                    className="cursor-pointer"
                                >
                                    Change Photo
                                </Button>

                                {/* Hidden file input */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-sm text-gray-400">Email</label>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="
                                    bg-white 
                                    text-black 
                                    placeholder-gray-500 
                                    border 
                                    border-gray-300 
                                    focus:border-blue-500 
                                    focus:ring-2 
                                    focus:ring-blue-500
                                   "
                            />
                        </div>

                        {/* Name */}
                        <div>
                            <label className="text-sm text-gray-400">Display Name</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your display name"
                                className="
                                    bg-white 
                                    text-black 
                                    placeholder-gray-500 
                                    border 
                                    border-gray-300 
                                    focus:border-blue-500 
                                    focus:ring-2 
                                    focus:ring-blue-500
                                   "
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label className="text-sm text-gray-400">Role</label>
                            <Input value="Super Admin" disabled />
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 border-t border-gray-600 pt-6">
                    <Button variant="outline" onClick={onBack}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                        style={{
                            backgroundColor: "#3B82F6",
                            color: "white",
                            boxShadow: "0 0 12px rgba(59,130,246,0.4)",
                        }}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>

                </div>
            </div>
        </div>
    );
}
