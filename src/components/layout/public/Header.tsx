"use client";

import { toast } from "@/components/ui/toast";
import { useGetLoggedInUser, useLogout } from "@/hooks";
import { Button } from "@base-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, HeartPulse, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const routes = [
  { name: "Home", url: "/" },
  { name: "About us", url: "/about" },
  { name: "Our services", url: "/#services" },
  { name: "Contact", url: "/#contact" },
];

function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);


  const { data, isLoading } = useGetLoggedInUser()
  const { mutate: logout } = useLogout()
  const queryClient = useQueryClient()

  console.log(data)
  const isActive = (url: string) => {
    const routePath = url.split("#")[0];
    return routePath === "/"
      ? pathname === "/"
      : pathname.startsWith(routePath);
  };

  const handelLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.add({
          title: "logged out",
          description: "Logged Out Successfully",
          type: "success"
        })
        queryClient.removeQueries({
          queryKey: ["user"]
        })
      },
      onError: () => {
        toast.add({
          title: "logged out faile",
          description: "Something went wrong",
          type: "error"
        })

      }
    })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
          onClick={() => setIsOpen(false)}
          aria-label="MediCare home"
        >
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:rotate-6">
            <HeartPulse className="size-6" strokeWidth={2.3} />
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Medi<span className="text-primary">Care</span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {routes.map((route) => (
            <Link
              key={route.name}
              href={route.url}
              className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${isActive(route.url)
                ? "bg-primary/10 text-primary"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
            >
              {route.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">

          {!isLoading && !data && (
            <Link

              href="/login"
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >

              Log in
            </Link>
          )}

          {!isLoading && data && (
            <Button

              onClick={handelLogout}
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              logout
            </Button>
          )}


          {/* <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Get started
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link> */}
        </div>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 md:hidden ${isOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <nav
          className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-8"
          aria-label="Mobile navigation"
        >
          {routes.map((route) => (
            <Link
              key={route.name}
              href={route.url}
              onClick={() => setIsOpen(false)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${isActive(route.url)
                ? "bg-primary/10 text-primary"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
            >
              {route.name}
            </Link>
          ))}
          <div className="mt-3 flex gap-3 border-t border-slate-100 pt-4">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Log in
            </Link>
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20"
            >
              Get started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
