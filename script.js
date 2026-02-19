const towns = [
  { name: "Madanapalle", lat: 13.55, lon: 78.50 },
  { name: "Chittoor", lat: 13.22, lon: 79.10 },
  { name: "Tirupati", lat: 13.63, lon: 79.42 },
  { name: "Kadapa", lat: 14.47, lon: 78.82 },
  { name: "Anantapur", lat: 14.68, lon: 77.60 },
  { name: "Kurnool", lat: 15.83, lon: 78.03 },
  { name: "Ongole", lat: 15.50, lon: 80.05 },
  { name: "Tenali", lat: 16.24, lon: 80.64 },
  { name: "Rajahmundry", lat: 17.00, lon: 81.78 },
  { name: "Hyderabad", lat: 17.38, lon: 78.48 }
];

const citySelect = document.getElementById("citySelect");
const forecastContainer = document.getElementById("forecastContainer");

towns.forEach(town => {
  const opt = document.createElement("option");
  opt.value = town.name;
  opt.textContent = town.name;
  citySelect.appendChild(opt);
});

function weatherLabel(code){
  if([0].includes(code)) return {type:"sunny", label:"Sunny"};
  if([1,2,3].includes(code)) return {type:"cloudy", label:"Cloudy"};
  if([51,53,55,61,63,65,80,81,82].includes(code)) return {type:"rainy", label:"Rainy"};
  if([71,73,75].includes(code)) return {type:"snowy", label:"Snowy"};
  if([95,96,99].includes(code)) return {type:"storm", label:"Storm"};
  return {type:"sunny", label:"Sunny"};
}

function formatHour(hour){
  const ampm = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:00 ${ampm}`;
}

function getWeather(){
  const town = towns.find(t=>t.name===citySelect.value);
  forecastContainer.innerHTML = "Loading...";

  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${town.lat}&longitude=${town.lon}&hourly=temperature_2m,weathercode&timezone=Asia/Kolkata`)
  .then(res=>res.json())
  .then(data=>{
    forecastContainer.innerHTML = "";

    const hours = data.hourly.time;
    const temps = data.hourly.temperature_2m;
    const codes = data.hourly.weathercode;

    const daysMap = {};

    hours.forEach((h,i)=>{
      const dateObj = new Date(h);
      const hour = dateObj.getHours();
      if(hour % 2 === 1){ // 2-hour intervals starting at 1:00 AM
        const day = dateObj.toLocaleDateString('en-IN', {weekday:'short', day:'numeric', month:'short'});
        if(!daysMap[day]) daysMap[day] = [];

        const {type, label} = weatherLabel(codes[i]);

        daysMap[day].push({
          hourLabel: formatHour(hour),
          temp: temps[i],
          type,
          label
        });
      }
    });

    for(let day in daysMap){
      const dayCard = document.createElement("div");
      dayCard.className="day-card";

      const label = document.createElement("div");
      label.className="day-label";
      label.textContent = day;
      dayCard.appendChild(label);

      const hourRow = document.createElement("div");
      hourRow.className="hour-row";

      daysMap[day].forEach(h=>{
        const block = document.createElement("div");
        block.className=`hour-block ${h.type}`;
        block.innerHTML=`${h.hourLabel}<br>${h.label}<br>${h.temp}°`;
        hourRow.appendChild(block);
      });

      dayCard.appendChild(hourRow);
      forecastContainer.appendChild(dayCard);
    }
  })
  .catch(()=>{
    forecastContainer.innerHTML = "Error fetching data!";
  });
}
