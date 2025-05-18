import AdminRegistrationForm from "@/components/AdminRegistrationForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AdminRegistration = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <AdminRegistrationForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminRegistration;
