'use client'

import { Menu } from "@headlessui/react";
import { useRouter } from "next/navigation";


interface Props {
  onLogout: () => void;
  userName?: string;  
}

export default function UserDropdownMenu({ onLogout, userName }: Props) {
  const router = useRouter();

  return (
    <Menu as="div" className="relative inline-block text-left">
  <Menu.Button className="cursor-pointer flex items-center p-2 focus:outline-none space-x-2">
    <div className="hover:scale-110 w-5 h-5 mr-5">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-gray-700"
    >
      <path
        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
        stroke="#222222"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.5901 22C20.5901 18.13 16.7402 15 12.0002 15C7.26015 15 3.41016 18.13 3.41016 22"
        stroke="#222222"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    </div>
    
    <span className="hidden sm:inline font-montserrat text-gray-700 cursor-pointer select-none hover:scale-110">
  Hei, <span className="font-bold">{userName ?? 'Kasutaja'}</span>.
</span>

  </Menu.Button>

      <Menu.Items className=" font-medium absolute right-0 mt-2 w-56 origin-top-right bg-[#F8C6DF] shadow-lg z-50 focus:outline-none font-montserrat ">
        <div className="py-1">
          {[
            { label: "Lemmikud", href: "/lemmikud" },
            { label: "Minu Pood", href: "/minu-pood" },
            { label: "Minu Poe Tellimused", href: "/minu-poe-tellimused" },
            { label: "Minu Ostud", href: "/minu-ostud" },
            { label: "Konto Seaded", href: "/konto" },
            { label: "Liikmelisus", href: "/liikmelisus" },
          ].map(item => (
            <Menu.Item key={item.label}>
              {({ active }) => (
                <button
                  onClick={() => router.push(item.href)}
                  className={`${
                    active ? "bg-gray-100" : ""
                  } w-full text-left px-4 py-2 text-sm text-gray-700`}
                >
                  {item.label}
                </button>
              )}
            </Menu.Item>
          ))}
        </div>
        <div >
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onLogout}
                className={`${
                  active ? "bg-red-100" : ""
                } w-full text-left px-4 py-2 text-sm font-semibold text-red-600`}
              >
                Logi välja
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
}
