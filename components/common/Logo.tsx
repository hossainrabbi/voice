import Image from "next/image";

type Props = {
  type?: "light" | "dark";
};

export default function Logo({ type }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center text-white font-medium text-xl tracking-tight font-mono">
        <Image
          src={type === "light" ? "/images/logo-white.svg" : "/images/logo.svg"}
          alt="Logo"
          width={70}
          height={24}
          className="mr-1"
        />
        <span className="text-indigo-600 font-semibold italic">Ai</span>
      </span>
    </div>
  );
}
