export default function Footer() {
  return (
    <footer className="border-t border-gray-600 px-5 pb-11 pt-7 text-sm sm:px-8 md:px-16">
      <div className="mx-auto max-w-[1240px] text-gray-500">
        &copy; {new Date().getFullYear()} Ahmed Almaz
      </div>
    </footer>
  );
}
