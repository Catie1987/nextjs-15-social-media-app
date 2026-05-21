import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo.png";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-card shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-5 px-5 py-3">
        <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
          <Image src={logo} alt="HeartFolio Logo" className="inline object-fill h-8 w-auto" />
          <div className="max-sm:hidden">HeartForlio</div>
        </Link>
        <SearchField />
        <UserButton className="sm:ms-auto" />
      </div>
    </header>
  );
}
