"use client";

import React, { useState } from "react";
import Image from "next/image";

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
  const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0]);
  const [selectedTopic, setSelectedTopic] = useState<Topic>(categories[0].topics[0]);
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
    <div style={{ display: "flex", flexDirection: "column", fontFamily: "Montserrat", height: "100vh" }}>
      {/* Ülemine riba: pilt vasakul + otsing paremal */}
      <div style={{ display: "flex", height: "300px", borderBottom: "1px solid #ccc" }}>
        {/* Pilt vasakul */}
       <div style={{ flex: 1, position: "relative", height: "100vh" }}>
  <Image
    src="/images/help-image.jpg"
    alt="Abi"
    fill
    style={{
      objectFit: "cover",     // täidab kogu ala
      objectPosition: "left", // hoiab vasaku külje alati nähtaval
    }}
    priority
  />
</div>


        {/* Otsing paremal */}
        
<div
  style={{
    width: "600px",
    display: "flex",
    flexDirection: "column", // et tekst oleks otsingu kohal
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    padding: "20px",
    textAlign: "center",
  }}
>
  {/* Suur pealkiri */}
  <h1
    style={{
      fontSize: "28px",
      fontWeight: "600",
      marginBottom: "20px",
      color: "#333",
    }}
  >
    Kuidas saame sind aidata?
  </h1>

  {/* Otsingukast */}
  <input
    type="text"
    placeholder="🔍 Otsi..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{
      padding: "12px 18px",
      borderRadius: "25px",
      border: "1px solid #ccc",
      width: "100%",
      fontSize: "14px",
      outline: "none",
    }}
  />

  {/* Dropdown otsingutulemused */}
  {filteredTopics.length > 0 && (
<div
  style={{
    position: "absolute",
    top: "205px", // nihutasin allapoole, sest pealkiri on lisatud
    right: "20px",
    left: "20px",
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    maxHeight: "260px",
    overflowY: "auto",
    zIndex: 100,
    textAlign: "left", // <-- õige property
  }}
>

      {filteredTopics.map((topic) => (
        <div
          key={topic.title + topic.categoryName}
          onClick={() => {
            setSelectedCategory(
              categories.find((c) => c.name === topic.categoryName) || categories[0]
            );
            setSelectedTopic(topic);
            setSearchTerm("");
          }}
          style={{
            padding: "12px",
            cursor: "pointer",
            borderBottom: "1px solid #eee",
          }}
        >
          <div style={{ fontWeight: "bold" }}>{topic.title}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{topic.categoryName}</div>
        </div>
      ))}
    </div>
  )}
</div>

      </div>

      {/* Alumine ala: vasakul teemad, paremal sisu */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Vasak külgriba teemadega */}
        <div
          style={{
            width: "260px",
            borderRight: "1px solid #ccc",
            padding: "15px",
            overflowY: "auto",
            backgroundColor: "#fafafa",
          }}
        >
          {selectedCategory.topics.map((topic) => (
            <div
              key={topic.title}
              onClick={() => setSelectedTopic(topic)}
              style={{
                padding: "10px",
                marginBottom: "6px",
                cursor: "pointer",
                borderRadius: "6px",
                backgroundColor:
                  topic.title === selectedTopic.title ? "#ffe6e6" : "transparent",
                transition: "background 0.2s",
              }}
            >
              {topic.title}
            </div>
          ))}
        </div>

        {/* Paremal põhisisu */}
        <div style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
          {/* Kategooriate nupud */}
          <div style={{ marginBottom: "25px" }}>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedTopic(cat.topics[0]);
                  setSearchTerm("");
                }}
                style={{
                  marginRight: "10px",
                  padding: "8px 18px",
                  border: "1px solid #ccc",
                  borderRadius: "25px",
                  backgroundColor:
                    cat.name === selectedCategory.name ? "#f4c2c2" : "#fff",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Valitud teema */}
          <h2 style={{ marginBottom: "20px" }}>{selectedTopic.title}</h2>
          <ol style={{ paddingLeft: "20px" }}>
            {selectedTopic.content.map((point, idx) => (
              <li key={idx} style={{ marginBottom: "12px", lineHeight: "1.6" }}>
                {point}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;