export default function Footer() {
  return (
    <footer className="border-t border-line px-5 pb-11 pt-7 text-sm text-muted sm:px-8 md:px-16">
      <div className="mx-auto max-w-[1240px]">
        &copy; {new Date().getFullYear()} Ahmed Almaz
      </div>
    </footer>
  );
}
