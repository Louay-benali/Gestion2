import React from "react";
import UserProfile from "../layout/UserProfile";
import Layout from "../layout/Layout";

const ProfilePage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
          <UserProfile />
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage; 