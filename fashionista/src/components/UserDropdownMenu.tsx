'use client'

import { Menu } from "@headlessui/react";
import { FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface Props {
  onLogout: () => void;
}

export default function UserDropdownMenu({ onLogout }: Props) {
  const router = useRouter();

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center p-2   focus:outline-none">
  <img src="/icons/user.svg" alt="User Icon" className="hover:scale-110 w-5 h-5" />
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
