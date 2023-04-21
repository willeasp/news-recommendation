import React, { useState, useEffect } from "react";
import axios from "axios";

const NewsSearch = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [relevance, setRelevance] = useState([])
  
  const articles = [
    {
      title: 'Johanna, 20, och Maja, 18, döms till livstids fängelse för mordet på Tove',
      content: 'Johanna Leshem Jansson, 20, och Maja Hellman, 18, döms till livstids fängelse för mordet på 21-åriga Tove i Vetlanda. De döms för mord och grovt gravfridsbrott, och tingsrätten bedömer att de har agerat i samförstånd. Båda två har suttit häktade sedan dagen efter Toves försvinnande. Tingsrätten bedömer att Johanna Leshem Jansson har suttit på Toves kropp och strypt henne, samtidigt som Maja Hellman har hållt i hennes armar. I domen går det att läsa att Johanna Leshem Jansson har agerat med avsiktsuppsåt och Maja Hellman har agerat med insiktsuppsåt. Under rättegången har Maja Hellman redovisat för sin version, där hon menar att hon legat och sovit, och plötsligt funnit Tove inlindad i ett lakan i lägenheten. De bedömer tingsrätten vara en efterhandskonstruktion. Tove, 21, försvann efter en utekväll på nattklubben Nöjet den 15 oktober. Efter två veckor hittades hennes kropp i en skog utanför Vetlanda.'
    },
    {
      title: 'Tvingades sy 75 stygn',
      content: 'Winnipeg besegrade Vegas Golden Knights med 5-1 i den första slutspelsmatchen och kanadensarna visade direkt att de blir svårbemästrade i vår. För lagets 24-årige forward Morgan Barron blev det en speciell match. Tidigt i den första perioden var han inblandad i ett grupp framför motståndarburen när målvakten Laurent Brossoits skridskoskena skar honom i ansiktet. ”Attackerad av en haj” Blodet forsade från pannan på Winnipeg-spelaren som lämnade matchen. 75 styng och halva matchen senare var han tillbaka i spel igen. - De gjorde ett bra jobb med att sy ihop mig och uppenbarligen missade den mitt öga, så jag är bara glad att det inte blev värre, sade Barron efter matchen. Lagkamraten Adam Lowry var med ute på isen när det hände. - Han såg ut att ha blivit attackerad av en haj om jag ska vara ärlig. Det var skrämmande, säger han.'
    },
  ]

  const checkbox = (name) => {
    if (document.getElementById(name).style.backgroundColor === "rgb(48, 107, 52)") {
      document.getElementById(name).style.backgroundColor = "";
      document.getElementById(name).style.borderColor = "#222222";
    }
    else {
      document.getElementById(name).style.backgroundColor = "#306B34";
      document.getElementById(name).style.borderColor = "#306B34";
    }
  }

  const toggleRelevance = (idx) => {
    var data = [...relevance];
    data[0][idx] = !data[0][idx];
    setRelevance(data)
  }

  const getResults = () => {
    setResults(articles)
    if (relevance.length === 0) setRelevance([Array.apply(null, Array(articles.length)).map( _ => false )])
  }

  /*
  useEffect(() => {
    
    const searchMovies = async () => {
      console.log("searchMovies")
      const res = await axios.get("http://localhost:5000/search", {
        proxy: {
          host: 'cors-proxy.com',
        },
        params: {
          name: name,
          actors: actors,
          genre: genre,
          date: date
        }
      });
      setMovies(res.data.hits.hits);
    }

    if (name || actors || genre || date) {
      searchMovies();
    } else {
      setMovies([]);
    }
    
  }, [name, actors, genre, date]);

  */
  return (
    <div className="container">
      <form>
        <label>
          Sök efter artikel
          <div className="input">
            <input type='text' value={search} onChange={ (e) => setSearch(e.target.value) } />
            <button onClick={(e) => { getResults(); e.preventDefault(); console.log(relevance); } }>Sök</button>
          </div>
        </label>
      </form>
      {results.length > 0 && (
        <div className="results">
          {results.map((item, idx) => { return (
            <div key={idx} className="article">
              <h1>{item.title}</h1>
              <p>{item.content}</p>
              <div className="buttons">
                <button>Läs mer</button>
                <div className="checkbox" onClick={() => {checkbox(`article-${idx}`); toggleRelevance(idx)}}>
                  <div id={`article-${idx}`}></div>
                  Mer som detta
                </div>        
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  )

  /*
  return (
    <div>
      <form>
        <label>
          Name:
          <input type="text" value={name} onChange={event => setName(event.target.value)} />
        </label>
        <br />
        <label>
          Actors:
          <input type="text" value={actors} onChange={event => setActors(event.target.value)} />
        </label>
        <br />
        <label>
          Genre:
          <input type="text" value={genre} onChange={event => setGenre(event.target.value)} />
        </label>
        <br />
        <label>
          Release Date:
          <input type="text" value={date} onChange={event => setDate(event.target.value)} />
        </label>
      </form>
      <div>
        {movies.map(movie => (
          <div key={movie._id}>
            <img src={movie._source.poster_url} alt={movie._source.name} />
            <h2>{movie._source.name}</h2>
            <p>Actors: {movie._source.actors}</p>
            <p>Genre: {movie._source.genre}</p>
            <p>Release Date: {movie._source.release_date}</p>
          </div>
        ))}
      </div>
    </div>
  );
  */
}





export default NewsSearch;
