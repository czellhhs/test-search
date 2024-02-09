import React, { useEffect, useRef, useState } from "react";
import "./App.css";

interface SearchResults {
  hits: {
    total: { value: number };
    hits: any[];
  };
}
const searchEs = async (searchTerm: string): Promise<SearchResults> => {
  const resp = await fetch(
    "http://localhost:9200/pages/_search?q=" + searchTerm,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        highlight: {
          // text chunk size with match
          fragment_size: 150,
          fields: {
            // allfields
            "*": {},
          },
        },
      }),
    }
  );
  const json = await resp.json();
  return json;
};

function App() {
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<SearchResults | undefined>(undefined);
  const timeoutHdl = useRef<any>(null);

  useEffect(() => {
    if (!searchValue?.trim()) {
      setResults(undefined);
      return;
    }
    if (timeoutHdl.current !== null) {
      clearTimeout(timeoutHdl.current);
    }

    // settle time of 1sec before searching
    timeoutHdl.current = setTimeout(async () => {
      setResults(await searchEs(searchValue));
    }, 1000);

    // on umount - clear any pending timers
    return () => {
      if (timeoutHdl.current !== null) {
        clearTimeout(timeoutHdl.current);
      }
    };
  }, [searchValue]);
  return (
    <div className="App">
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </form>
      <div>{`${results?.hits?.total?.value} hits` ?? null}</div>
      <div className="search-results">
        {/* Display results... since we want highlighted results, and ES embeds <em/> tags for the
        highlighted hits, we need to use a cheap and easy way to honor that styling... hence dangerouslySetInnerHTML :( */}
        {results?.hits.hits.map((h) => (
          <span style={{ display: "flex", flexDirection: "column" }}>
            {/* Link the title of the article to the full slug */}
            <a href={h._source.fullSlug}>
              <span
                className="search-result-title"
                dangerouslySetInnerHTML={{
                  // use the matched/highlight title if there was indeed a match there
                  // or just fallback to the regular, non-highlighted title
                  __html: h.highlight.title ?? h._source.title,
                }}
              />
            </a>
            {/* For each highlighted match found in the `text` field... display as own 'chunk' */}
            {h.highlight.text.map((match: any) => (
              <span
                className="search-result-text"
                dangerouslySetInnerHTML={{ __html: `${match}...` }}
              />
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

export default App;
