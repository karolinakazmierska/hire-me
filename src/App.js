import React, { useState, useEffect } from 'react';
import './App.css';
import InfiniteScroll from 'react-infinite-scroll-component';

function App() {
    const API_KEY = process.env.REACT_APP_DAYCARE_API_KEY;
    const NUM = 12;
    const url = `https://app.famly.co/api/daycare/tablet/group?accessToken=${API_KEY}&groupId=86413ecf-01a1-44da-ba73-1aeda212a196&institutionId=dc4bd858-9e9c-4df7-9386-0d91e42280eb`;

    const [children, setChildren] = useState([]);
    const [items, setItems] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    /** Fetching data from the API */
    useEffect(() => {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                setChildren(data.children);
                setItems(data.children.slice(0,NUM));
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                setError(true);
            })

    }, [url])

    /** Method adding more data for infinite scroll mechanism */
    const fetchMoreData = () => {
        if (items.length >= children.length) {
            setHasMore(false);
            return;
        }
        setTimeout(() => { // Timeout added for better infinte scroll visibility on UI
            setItems(items.concat(children.slice(items.length, items.length+NUM)))
        }, 800);
    };

    /** Method handling click on check in & check out buttons */
    const handleClick = (id, isCheckedIn) => {
        const url = `https://app.famly.co/api/v2/children/${id}/${isCheckedIn ? 'checkout' : 'checkins'}`;
        let pickupTime = '';
        if (!isCheckedIn) {
            const d = new Date();
            let h = addZero(d.getHours());
            let m = addZero(d.getMinutes());
            pickupTime = `&pickupTime=${h}:${m}`
        }
        fetch(url, {
            body: `accessToken=${API_KEY}${pickupTime}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST"
        })
            .then(response => response.json())
            .then(data => {
                let id = data.childId ? data.childId : data[0].childId;
                let newItems = items.map(i => {
                    if (i.childId === id) {
                        i.checkedIn = !i.checkedIn;
                    }
                    return i;
                })
                setItems(newItems);
            })
            .catch(error => {
                console.log(error);
            })
    }

    /** Helper method adding 0 to hours/minutes */
    const addZero = (i) => {
        if (i < 10) { i = "0" + i }
        return i;
    }

    if (loading && !error) return "Loading...";
    if (error) return "Error";

    return (
        <div className="container">
            <div className="title">Daycare list</div>
            <InfiniteScroll
                dataLength={items.length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={<p>Loading...</p>}
                endMessage={<p className="end">End of results</p>}
            >
                {items.map((child, index) => (
                    <div className="child" key={index}>
                        <div className="name">{child.name.fullName}</div>
                        <div className="check">
                            {
                                child.checkedIn ? (
                                    <div className="btn check-in" onClick={() => handleClick(child.childId, true)}>Check out</div>
                                ) : (
                                    <div className="btn check-out" onClick={() => handleClick(child.childId, false)}>Check in</div>
                                )
                            }
                        </div>
                    </div>
                ))}
            </InfiniteScroll>
        </div>
    );
}

export default App;
