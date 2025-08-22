"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react"; // ikoonid

type Topic = {
  title: string;
  content: string[];
};

type Category = {
  name: string;
  topics: Topic[];
};

const categories: Category[] = [
  {
    name: "Ostjale",
    topics: [
      { 
        title: "Enne ostmist", 
        content: [
          "Vaadake müüja hinnangut ja toote kirjeldust.",
          "Kontrollige, kas toode vastab teie ootustele.",
          "Lugege eelnevate ostjate tagasisidet.",
          "Veenduge, et müüja tarnetingimused ja asukoht sobivad teile.",
          "Kontrollige, kas toode on uus või kasutatud, ja vaadake fotosid hoolikalt."
        ] 
      },
      { 
        title: "Maksete tegemine", 
        content: [
          "Kasuta turvalisi makseviise, nagu pangalink või PayPal.",
          "Ärge saatke raha väljaspool platvormi.",
          "Kontrollige makseandmeid enne kinnitamist.",
          "Salvestage maksetõendid ja arved.",
          "Veenduge, et teil on piisav saldo või krediitkaart makse sooritamiseks."
        ] 
      },
      { 
        title: "Kohaletoimetamine", 
        content: [
          "Kui kaup ei jõua kohale, kontrollige müüjaga ühendust.",
          "Jälgige jälgimisnumbrit ja eeldatavat kohaletoimetamise kuupäeva.",
          "Kontrollige, kas aadress on õigesti sisestatud.",
          "Kaitske ennast kindlustuse või jälgimisvõimalustega, kui saadetis on väärtuslik."
        ] 
      },
      { 
        title: "Tagasiside ja suhtlemine", 
        content: [
          "Jätke aus tagasiside pärast tehingut.",
          "Suhelge viisakalt ja arusaadavalt.",
          "Kui ilmneb probleem, proovige esmalt müüjaga lahendada.",
          "Hinnangute põhjal otsustage tulevaste tehingute üle."
        ] 
      },
      { 
        title: "Tagastused ja tühistamised", 
        content: [
          "Kui toode ei sobi, kontrollige tagastuspoliitikat.",
          "Võtke ühendust müüjaga enne tagastuse tegemist.",
          "Järgige platvormi juhiseid tühistamiseks või tagastamiseks.",
          "Hoia alles kõik pakendi ja saadetise dokumendid."
        ] 
      },
    ],
  },
  {
    name: "Müüjale",
    topics: [
      { 
        title: "Pakkide saatmine", 
        content: [
          "Saada kaup õigeaegselt ja hoia ostjaga ühendust.",
          "Kasuta turvalist pakendamist, et kaup ei kahjustuks.",
          "Lisage jälgimisnumber ja teavitused ostjale.",
          "Kontrollige, kas aadress on õige ja täielik."
        ] 
      },
      { 
        title: "Maksete haldamine", 
        content: [
          "Veendu, et kõik maksed on laekunud enne saatmist.",
          "Kontrolli makset iga tellimuse puhul.",
          "Ärge aktsepteerige makseid väljaspool platvormi.",
          "Hoidke arvestust maksete ja tagasimaksete kohta."
        ] 
      },
      { 
        title: "Kliendisuhtlus", 
        content: [
          "Vasta küsimustele viisakalt ja kiirelt.",
          "Lahenda probleemid professionaalselt.",
          "Selgita tarnetingimusi ja tagastuspoliitikat.",
          "Kui klient on rahulolematu, paku lahendusi, mis on õiglane mõlemale poolele."
        ] 
      },
    ],
  },
  {
    name: "Tehniline probleem",
    topics: [
      { 
        title: "Veebilehe probleemid", 
        content: [
          "Kontrolli oma internetiühendust ja brauserit.",
          "Proovi lehte värskendada või teist seadet.",
          "Tühjenda brauseri vahemälu ja küpsised.",
          "Võta ühendust klienditoega, kui probleem püsib."
        ] 
      },
      { 
        title: "Makselahendused ei tööta", 
        content: [
          "Proovi teist maksemeetodit.",
          "Kontrolli, kas kaardil või pangalingil on piiranguid.",
          "Võta ühendust klienditoega, kui probleem püsib.",
          "Ära proovi mitut korda järjest, et vältida lukustatud kontot."
        ] 
      },
      { 
        title: "Tellimuse kuvatamine", 
        content: [
          "Uuenda leht ja kontrolli, kas tellimus on salvestatud.",
          "Kontrolli oma konto seadeid ja tellimuste ajalugu.",
          "Veendu, et tellimus on kinnitatud makse ja saatmise osas.",
          "Kui tellimus puudub, kontakteeru klienditoega."
        ] 
      },
    ],
  },
];

const HelpPage: React.FC = () => {
const [mobileView, setMobileView] = useState<"list" | "detail">("list");
const [selectedCategory, setSelectedCategory] = useState(categories[0]);
const [selectedTopic, setSelectedTopic] = useState(categories[0].topics[0]);
  const [searchTerm, setSearchTerm] = useState("");



  // Kõik teemad otsingu jaoks
  const allTopics = categories.flatMap((cat) =>
    cat.topics.map((topic) => ({ ...topic, categoryName: cat.name }))
  );

  const filteredTopics =
    searchTerm.trim() === ""
      ? []
      : allTopics.filter(
          (topic) =>
            topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            topic.content.some((line) =>
              line.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );

return (
  <div className="flex flex-col font-montserrat min-h-screen">
    {/* Ülemine ala */}
    <div className="relative w-full border-b h-[300px] sm:h-[400px] md:h-[500px] lg:h-[400px] flex">
      {/* Pilt */}
      <div className="relative w-full sm:w-1/3 h-full">
        <Image
          src="/images/help-image.jpg"
          alt="Abi"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </div>

      {/* Otsing ja pealkiri suurtele ekraanidele */}
      <div className="hidden sm:flex sm:w-2/3 flex-col justify-center items-center relative p-6">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          Kuidas saame sind aidata?
        </h1>
        <div className="w-full max-w-md relative">
          <input
            type="text"
            placeholder="🔍 Otsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 bg-white rounded-full border border-gray-300 text-sm outline-none
                       shadow-md focus:border-pink-300 focus:ring-1 focus:ring-pink-200"
          />
          {filteredTopics.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-300
                            rounded-md shadow-lg max-h-64 overflow-y-auto z-50">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.title + topic.categoryName}
                  onClick={() => {
                    setSelectedCategory(
                      categories.find((c) => c.name === topic.categoryName) ||
                        categories[0]
                    );
                    setSelectedTopic(topic);
                    setSearchTerm("");
                  }}
                  className="p-3 cursor-pointer border-b border-gray-100 hover:bg-pink-50"
                >
                  <div className="font-bold">{topic.title}</div>
                  <div className="text-xs text-gray-600">
                    {topic.categoryName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Väikeste ekraanide pealkiri ja otsing pildi peal */}
      <div className="absolute left-1/2 top-[75%] transform -translate-x-1/2 sm:hidden text-center px-4 z-10">
        <h1 className="text-white text-2xl font-semibold mb-4">
          Kuidas saame sind aidata?
        </h1>
        <input
          type="text"
          placeholder="🔍 Otsi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-[90vw] bg-white px-5 py-3 rounded-full border border-gray-300 text-sm outline-none
                     shadow-md focus:border-pink-300 focus:ring-1 focus:ring-pink-200"
        />
        {filteredTopics.length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-300
                          rounded-md shadow-lg max-h-64 overflow-y-auto z-20">
            {filteredTopics.map((topic) => (
              <div
                key={topic.title + topic.categoryName}
                onClick={() => {
                  setSelectedCategory(
                    categories.find((c) => c.name === topic.categoryName) ||
                      categories[0]
                  );
                  setSelectedTopic(topic);
                  setSearchTerm("");
                }}
                className="p-3 cursor-pointer border-b border-gray-100 hover:bg-pink-50"
              >
                <div className="font-bold">{topic.title}</div>
                <div className="text-xs text-gray-600">
                  {topic.categoryName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Kategooriate nupud */}
    <div className="mb-6 flex flex-wrap gap-2 items-center justify-center mt-10">
      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => {
            setSelectedCategory(cat);
            setSelectedTopic(cat.topics[0]);
            setSearchTerm("");
          }}
          className={`px-4 py-2 rounded-full border transition-colors ${
            cat.name === selectedCategory.name
              ? "bg-pink-200 border-pink-400"
              : "bg-white border-gray-300"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>

    {/* Breadcrumb väiksel ekraanil */}
    <div className="sm:hidden px-4 text-sm text-gray-700">
      {selectedCategory && selectedTopic && (
        <div className="font-semibold">
          
        </div>
      )}
    </div>

    {/* Väike ekraan: accordion teemade jaoks */}
   <div className="sm:hidden px-4 mt-4 mb-10">
  {mobileView === "list" && (
    <div className="space-y-2">
      {selectedCategory.topics.map((topic) => (
        <button
          key={topic.title}
          onClick={() => {
            setSelectedTopic(topic);
            setMobileView("detail");
          }}
          className="w-full flex items-center justify-between border-b last:border-b-0 px-4 py-3"
        >
          <span>{topic.title}</span>
          <ChevronRight className="w-5 h-5 text-black" />
        </button>
      ))}
    </div>
  )}

  {mobileView === "detail" && (
    <div>
      {/* Breadcrumb + back */}
     <div className="mb-4 text-sm">
  {/* Tagasi nupp eraldi real */}
  <div className="mb-1">
    <button
      onClick={() => setMobileView("list")}
      className="text-pink-500 font-medium"
    >
      ← Tagasi
    </button>
  </div>

  {/* Breadcrumb järgmisele reale */}
  <div className="text-gray-500 pl-5 pt-2 text-md">
    {selectedCategory.name} &gt; {selectedTopic.title}
  </div>
</div>


      {/* Sisu */}
      <h2 className="text-lg font-semibold mb-3">{selectedTopic.title}</h2>
      <ol className="pl-5 space-y-2 text-sm">
        {selectedTopic.content.map((point, idx) => (
          <li key={idx} className="leading-6">
            {point}
          </li>
        ))}
      </ol>
    </div>
  )}
</div>


    {/* Suur ekraan: sidebar + content */}
    <div className="hidden sm:flex flex-1 overflow-hidden justify-center mb-10">
      <div className="flex w-full max-w-5xl overflow-hidden">
        {/* Vasak külgriba */}
        <div className="w-64 p-4 overflow-y-auto border">
          {selectedCategory.topics.map((topic) => (
            <div
              key={topic.title}
              onClick={() => setSelectedTopic(topic)}
              className={`p-2 mb-2 cursor-pointer transition-colors ${
                topic.title === selectedTopic.title ? "font-bold" : ""
              }`}
            >
              {topic.title}
            </div>
          ))}
        </div>

        {/* Parem sisu */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">
            {selectedTopic.title}
          </h2>
          <ol className="pl-5 space-y-2">
            {selectedTopic.content.map((point, idx) => (
              <li key={idx} className="leading-6">
                {point}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  </div>
);


};

export default HelpPage;