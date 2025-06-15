"use client";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-4 px-6 mt-auto bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          &copy; {currentYear} VieiraDev. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 