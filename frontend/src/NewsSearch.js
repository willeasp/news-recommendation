import React, { useState, useEffect } from "react";
import axios from "axios";

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

    console.log(res.data);
    setRelevance(Array.apply(null, Array(res.data.hits.hits.length)).map(_ => false))
    setResults(res.data.hits.hits);
    
  }

  const expand = (idx) => {

    const art = document.querySelectorAll(".textDiv")

    console.log(art);
    
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
    })

    setOpen(idx)
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
            <button onClick={(e) => { getResults(); e.preventDefault(); } }>Sök</button>
          </div>
        </label>
      </form>
      <div className="results" id='results' onScroll={(e) => console.log(e)} >
        {results.map((item, idx) => { return (
          <div key={idx} className="article">
            <h1>{item._source.title}</h1>
            <p>{item._source.abstract}</p>
            <div className="textDiv" id={`text-${idx}`}>
              <div className="text">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec mattis tortor 
                ut tempus volutpat. Praesent vel dapibus mauris. Fusce facilisis augue non elit 
                volutpat, commodo finibus risus facilisis. Suspendisse lacus orci, tristique nec 
                maximus in, condimentum sed odio. Nunc eu condimentum leo. Cras euismod orci sit 
                amet porta luctus. Integer pellentesque venenatis sapien fringilla placerat. 
                Pellentesque finibus turpis eu rutrum rutrum. Sed in sem viverra, luctus mauris i
                d, placerat mauris. Donec odio nisl, venenatis vestibulum eros vitae, fermentum 
                bibendum lorem. Nullam sit amet viverra quam, at lacinia sem. Proin eget ante arcu. 
                Aliquam quis cursus orci, ut fringilla diam. Sed orci massa, imperdiet eu semper vitae,
                ullamcorper sed lorem. Nulla ac rutrum lorem. Proin sed orci ut mi euismod rhoncus. 
                Quisque leo erat, egestas sit amet facilisis in, malesuada eget urna. Nam iaculis 
                tristique nisi vehicula elementum. Pellentesque nec tincidunt augue. Vivamus faucibus 
                risus ac rhoncus venenatis. Fusce rutrum ligula lacus, ac sodales felis ullamcorper vel. 
                Nullam sit amet aliquet mauris. Vestibulum accumsan a nulla et convallis. Sed pulvinar est 
                ipsum, sed ullamcorper nibh dapibus consequat. Nam mattis augue eu velit scelerisque 
                eleifend. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos 
                himenaeos. Proin interdum risus viverra magna rutrum vulputate. Donec eleifend orci hendrerit 
                lacus efficitur dapibus. Morbi consequat ex maximus eleifend ornare. Nulla a lobortis felis.
                Nulla non ipsum ac erat tincidunt mattis. Sed feugiat id sem id condimentum. Sed tempus, dui 
                a interdum ornare, justo nibh vehicula dui, quis interdum nisi turpis vitae erat. In sit amet 
                justo et nisl blandit finibus. Nullam vulputate, metus ac finibus fringilla, dui eros 
                pretium purus, id volutpat dolor arcu id sem. Pellentesque tempus, felis sed volutpat 
                ultricies, ante turpis iaculis ante, ut pharetra mauris odio ac libero. Donec accumsan 
                tristique lacus ultricies blandit. Nunc at purus rutrum, varius nisl vel, eleifend nisi. 
                Donec convallis sem nec metus aliquam, a porttitor urna efficitur. Curabitur tempus 
                neque diam, in pulvinar turpis ornare ac. Nulla facilisi. Sed cursus lorem sit amet 
                dolor commodo mattis. Mauris faucibus, lorem et egestas congue, eros ligula rutrum 
                sapien, ut scelerisque ex massa ut lectus. Cras eget lectus accumsan, condimentum dolor 
                varius, aliquet leo. Maecenas nibh nisi, venenatis id metus ut, vulputate sagittis 
                lectus. Aliquam aliquet tellus tortor, at mattis odio finibus nec. Pellentesque nec 
                massa erat. Donec ex ligula, iaculis sit amet nunc in, commodo ullamcorper mauris. 
                Pellentesque congue purus quis massa auctor dictum. Aenean mollis in metus quis 
                rhoncus. Sed pharetra ultricies tristique. Sed ut est ut odio cursus vulputate eget 
                sed velit. Fusce scelerisque vel tellus sed bibendum. Nullam ut tempus libero, id 
                porttitor turpis. Nullam lacinia rhoncus quam, tempus pharetra quam bibendum ac. 
                Nunc pharetra consequat justo, et sagittis arcu fringilla ut. Curabitur ac diam vel 
                tellus hendrerit porttitor. Sed consectetur sem tellus, et auctor erat tincidunt sed. 
                Cras malesuada erat at blandit pretium. Morbi egestas vitae urna nec commodo. 
                Donec velit augue, ornare ut condimentum ac, gravida sit amet diam. Phasellus faucibus 
                accumsan dolor, quis ultricies elit. Etiam sed tortor luctus, euismod sem nec, tristique 
                lacus. Aliquam fringilla, ex non malesuada aliquam, dui leo bibendum nibh, ut varius mi 
                nisi vel arcu. Etiam est libero, euismod id arcu id, tincidunt blandit mauris. Sed nec 
                ullamcorper turpis, at varius justo. Donec vulputate interdum massa, elementum semper felis. 
              </div>
            </div>
            <div className="buttons">
              {open === idx ? <button onClick={() => expand(-1)}>Läs mindre</button> : <button onClick={() => expand(idx)}>Läs mer</button>}
              <div className="checkbox" onClick={() => {checkbox(`article-${idx}`); toggleRelevance(idx)}}>
                <div id={`article-${idx}`}></div>
                Mer som detta
              </div>        
            </div>
          </div>
        )})}
      </div>
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
