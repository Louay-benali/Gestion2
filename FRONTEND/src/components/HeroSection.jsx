import React from 'react';


const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-white py-24 sm:py-32 lg:py-40 pt-2">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between">
        {/* Texte + lien */}
        <div className="max-w-xl lg:max-w-lg">
          {/* Badge lien */}
          <div className="mb-6">
            <a href="#" className="inline-flex items-center text-indigo-600 hover:underline text-sm font-semibold">
              <span className="mr-2">What's new</span>
              <span className="flex items-center gap-1">
                Just shipped v1.0
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </a>
          </div>

          {/* Titre */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Deploy to the cloud with confidence
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat.
          </p>

          {/* Boutons */}
          <div className="mt-10 flex gap-x-6">
            <a
              href="#"
              className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Get started
            </a>
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Image */}
        <div className="mt-16 lg:mt-0 lg:ml-12">
          <img
            src="https://tailwindcss.com/plus-assets/img/component-images/project-app-screenshot.png"
            alt="App screenshot"
            width={600}
            className="rounded-xl shadow-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
