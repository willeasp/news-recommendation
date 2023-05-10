import React, { useState, useEffect } from "react";
import axios from "axios";

const logos = {
  'nytimes': './nytimes.png',
  'aftonbladet': './aftonbladet.svg',
}

const NewsSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [relevance, setRelevance] = useState([])
  const [open, setOpen] = useState(-1);
  const [time, setTime] = useState('');

  const toggleRelevance = (idx) => {
    if (relevance.find((id) => id === idx) !== undefined) {
      setRelevance(relevance.filter((id) => id !== idx) || []);
    } else {
      setRelevance([...relevance, idx]);
    }
  }

  const search = async () => {

    const start = performance.now()

    const getResults = async () => {
      console.log("Searching for articles");
      if (query.length === 0) {
        getLatest()
      }
      else {
        const res = await axios.post("http://localhost:5001/search",
              { relevant: relevance, },
              { params: { query: query, }, headers: { 'Content-Type': 'application/json', }
            });
                  setRelevance([]);
            setResults(res.data.hits.hits);
            return res.data.hits.hits;
      }
    }

    const res = await getResults() || [];
    const end = performance.now()
    console.log(res);
    if (res.length > 0) {
      setTime(`${(end - start).toFixed(2)} ms`);
    }
    else {
      setTime('')
    }

  }

  const expand = (idx) => {

    const art = document.querySelectorAll("#text")
    var nr = 0;

    art.forEach((_) => {
      if (idx === nr) {
        document.getElementById(`text-${nr}`).classList.remove('articleSmall');
      }
      else {
        document.getElementById(`text-${nr}`).classList.add('articleSmall')
      }
      nr = nr + 1;
    })

    setOpen(idx)
  }

  const getLatest = async () => {

    const getResults = async () => {
      console.log("Getting latest articles");
      const res = await axios.get("http://localhost:5001/latest", {
        params: {
          size: 20,
        }
      });
      setResults(res.data.hits.hits);
    }

    const start = performance.now();
    await getResults();
    const end = performance.now();
    if (results.length > 0) {
      setTime(`${(end - start).toFixed(2)} ms`);
    }
    else {
      setTime('')
    }

  }

  useEffect(() => {
    getLatest();
  }, []);

  return (
    <div className="container">
      <form>
        <label>
          Sök efter artikel
          <div className="input">
            <input type='text' value={query} onChange={ (e) => setQuery(e.target.value) } />
            <button onClick={(e) => { search(); e.preventDefault(); } }>Sök</button>
          </div>
        </label>
      </form>
      {time.length > 0 && (
        <h3>Hämtade {results.length} resultat på {time}</h3>
      )}
      <div className="results" id='results' onScroll={(e) => console.log(e)} >
        {results.map((item, idx) => {
          const [date, time] = item._source.date.split("T");
          return (
          <div key={idx} className="article">
            <div className="title-logo">
              <h1>{item._source.title}</h1>
              <img src={logos[item._source.publisher]} />
            </div>
            <h2>{`${date} kl. ${time}`}</h2>
            <div id='text'>
              <p className="articleText articleSmall" id={`text-${idx}`}>{item._source.text.replace("NYHETER", "").replace("Av:", "").trim()}</p>
            </div>
            <div className="buttons">
              <div className="buttons2">
                {open === idx ? <button onClick={() => expand(-1)}>Läs mindre</button> : <button onClick={() => expand(idx)}>Läs mer</button>}
                <button onClick={() => window.open(item._source.url)}>Gå till artikel</button>
              </div>
              <div className={[
                    'checkbox',
                    relevance.find((id) => id === item._id) !== undefined ? 'article-selected' : ''
                  ].join(' ')
              } onClick={() => {toggleRelevance(item._id)}}>
                Mer som detta
              </div>
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}

export default NewsSearch;