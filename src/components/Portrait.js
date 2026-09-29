import Image from "next/image";

export default function Portrait() {
  return (
    <div className="mx-auto w-[min(230px,53vw)] justify-self-center">
      <div className="border border-line p-[8px]">
        <div className="relative aspect-[3/4] overflow-hidden bg-surface">
          <Image
            src="/user.webp"
            alt="Portrait of Ahmed Almaz"
            fill
            priority
            draggable={false}
            sizes="300px"
            className="object-cover object-[50%_20%]"
          />
        </div>
      </div>
    </div>
  );
}
