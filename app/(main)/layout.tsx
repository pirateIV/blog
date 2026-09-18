import Divider from "@/components/layout/divider";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/nav";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <Divider />
      {children}
      <Footer />
    </>
  );
}
