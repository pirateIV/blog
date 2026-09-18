import React from "react";

export default function NewsletterSubscription() {
  return (
    <div className="px-5 py-10 lg:py-12.5 lg:px-15 bg-background-light">
      <div className="max-w-305 mx-auto">
        <div className="mx-auto flex flex-1 flex-col items-center gap-10 text-center">
          <div className="lg:w-[35%]">
            <p className="font-medium text-accent-orange text-sm">Join My Newsletter</p>
            <h3 className="text-[28px]/[1.2em] font-playfair-display font-medium">
              Get the best blog stories into your inbox!
            </h3>
          </div>
          <form className="flex flex-col gap-2.5 w-full md:w-1/2">
            <input
              type="email"
              className="p-3.75 bg-[#ebebeb] text-sm rounded-lg"
              placeholder="name@email.com"
            />
            <button className="p-3.75 font-semibold text-white text-sm bg-background-dark rounded-lg cursor-pointer">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
