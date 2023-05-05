import React, { useState, useEffect } from "react";
import axios from "axios";

const logos = {
  'nytimes': './nytimes.png',
  'aftonbladet': './aftonbladet.svg',
}

const NewsSearch = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [relevance, setRelevance] = useState([])
  const [open, setOpen] = useState(-1);
  
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
    data[idx] = !data[idx];
    setRelevance(data)
  }

  const getResults = async () => {
    console.log("Searching for articles");
    
    const res = await axios.get("http://localhost:5001/search", {
      params: {
        title: search,
      }
    });

    setRelevance(Array.apply(null, Array(res.data.hits.hits.length)).map(_ => false))
    console.log(res.data.hits.hits);
    setResults(res.data.hits.hits);
    
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
    
    /*
    var nr = 0;
    art.forEach((_) => {
      if (idx === nr) {
        const height = document.getElementById(`text-${nr}`).children[0].offsetHeight
        console.log(idx);
        document.getElementById(`text-${nr}`).style.height = `${height}px`;
      }
      else {
        document.getElementById(`text-${nr}`).style.height = '0px';
      }
      nr = nr + 1;
    }*/

    setOpen(idx)
  }

  const moreLikeThis = async (idx) => {

    console.log(`Want more articles which are like: ${results[idx]._source.title}`);
    const res = await axios.get("http://localhost:5001/recommend", {
      params: {
        title: results[idx]._source.title,
        text: results[idx]._source.text,
      }
    });

    setRelevance(Array.apply(null, Array(res.data.hits.hits.length)).map(_ => false))
    setResults(res.data.hits.hits);

  }

  return (
    <div className="container">
      <form>
        <label>
          Sök efter artikel
          <div className="input">
            <input type='text' value={search} onChange={ (e) => setSearch(e.target.value) } />
            <button onClick={(e) => { getResults(); e.preventDefault(); } }>Sök</button>
          </div>
        </label>
      </form>
      <div className="results" id='results' onScroll={(e) => console.log(e)} >
        {results.map((item, idx) => { return (
          <div key={idx} className="article">
            <div className="title-logo">
              <h1>{item._source.title}</h1>
              <img src={logos[item._source.publisher]} />
            </div>
            <h2>{item._source.date.split("T")[0]}</h2>
            <div id='text'>
              <p className="articleText articleSmall" id={`text-${idx}`}>{item._source.text.replace("NYHETER", "").replace("Av:", "").trim()}</p>
            </div>
            <div className="buttons">
              <div className="buttons2">
                {open === idx ? <button onClick={() => expand(-1)}>Läs mindre</button> : <button onClick={() => expand(idx)}>Läs mer</button>}
                <button onClick={() => window.open(item._source.url)}>Gå till artikel</button>
              </div>
              <div className="checkbox" onClick={() => {moreLikeThis(idx)}}>
                <div id={`article-${idx}`}></div>
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
