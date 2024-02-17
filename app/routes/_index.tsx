import { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { Egg } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="relative font-sans leading-relaxed">
      <nav className="sticky top-0 z-50 flex w-full bg-card/80 px-6 backdrop-blur-md dark:bg-black/80">
        <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between py-3">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              prefetch="intent"
              className="flex h-10 items-center gap-1"
            >
              <Egg className="h-10 w-10 stroke-[1.5px] text-primary" />
              <p className="text-lg font-bold">App</p>
            </Link>
            <div className="flex h-10 items-center gap-2">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "group px-2 text-primary/60 hover:text-primary hover:no-underline",
                )}
              >
                Docs
              </a>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "group hidden px-2 text-primary/60 hover:text-primary hover:no-underline md:flex",
                )}
              >
                Changelog
              </a>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "group hidden px-2 text-primary/60 hover:text-primary hover:no-underline md:flex",
                )}
              >
                Github
              </a>
            </div>
          </div>
          <div className="flex h-10 items-center gap-2">
            <Link to="/" className={cn(`${buttonVariants()} h-8 px-3`)}>
              Log In
            </Link>
          </div>
        </div>
      </nav>
      <div className="px-6">
        <div className="mb-24 mt-10 flex flex-col gap-4">
          <section className="flex flex-col items-center justify-center gap-4 p-16 md:p-24">
            <h1 className="q text-center text-4xl font-bold leading-tight md:text-8xl  lg:leading-[1.1]">
              Remix Cloudflare
              <br />
              Micro SaaS Stack
            </h1>
            <p className="max-w-screen-md text-center text-lg text-muted-foreground sm:text-xl">
              Build at the speed of light.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
