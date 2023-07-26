import { Button, CircularProgress, Input } from "@mui/material";
import { addDoc, collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import moment from "moment";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast, ToastContainer } from "react-toastify";
import { getArsenalFixturesForCurrentSeason } from "./ArsenalService";
import { auth, db } from "./firebase";
import { Loading } from "./Loading";
import { RawUserPrediction } from "./types/prediction";

function Predictions() {

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [arsenalFixtures, setArsenalFixtures] = useState<[]>([]);
    const [rawUserPredictions, setRawUserPredictions] = useState<RawUserPrediction[]>([]);
    const [user, loading] = useAuthState(auth);

    useEffect(() => {
        if (!user) {
            return;
        }
        const fetchData = async () => {
            await getScorePredictionsForUser();
            let afs = await getArsenalFixturesForCurrentSeason();

            // you only want PL fixtures
            afs = afs.filter(x => x.league.id === 39);
            await setArsenalFixtures(afs);
        }
        fetchData()
            .catch(console.error);
    }, [user, loading]);

    const getScorePredictionsForUser = async () => {
        const q = query(collection(db, "predictions"));
        const doc = await getDocs(q);
        const data = doc.docs.map(x => {
            const item = x.data();
            item.id = x.id;

            return item;
        }).filter(x => x.user === user.email);
        await setRawUserPredictions(data as any);
    }

    const updateUserPredictions = async (fixtureId: number, isHome: boolean, value: string) => {
        const index = rawUserPredictions.findIndex(x => x.fixtureId === fixtureId);
        if (index === -1) {
            const rawUserPrediction: RawUserPrediction = {
                id: null,
                fixtureId: fixtureId,
                user: user.email,
                home: isHome ? parseInt(value) : null,
                away: !isHome ? parseInt(value) : null
            };

            rawUserPredictions.push(rawUserPrediction);
            const ref = collection(db, 'predictions');
            const doc = await addDoc(ref, rawUserPrediction)
            rawUserPrediction.id = doc.id;
        }
        else {
            if (isHome) {
                rawUserPredictions[index].home = parseInt(value);
            }
            else {
                rawUserPredictions[index].away = parseInt(value);
            }

            const docRef = doc(db, "predictions", rawUserPredictions[index].id);
            await setDoc(docRef, rawUserPredictions[index]);
        }

        toast("Predictions Updated!", { autoClose: 1000 });
    }

    useEffect(() => {
        if (rawUserPredictions.length && arsenalFixtures.length) {
            setIsLoading(false);
        }
    }, [rawUserPredictions, arsenalFixtures]);

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <div>
            <div className="App">
                <h1>My Predictions</h1>
            </div>
            {arsenalFixtures.map((x: any, i) => {
                const homePredictionForThisGame = rawUserPredictions.find(u => u.fixtureId === x.fixture.id)?.home;
                const awayPredictionForThisGame = rawUserPredictions.find(u => u.fixtureId === x.fixture.id)?.away;
                // must submit predictions 24 hours before the game
                const canEdit = moment(x.fixture.date) > moment().add(24, 'hours');
                return (
                    <div>
                        <div className={`prediction-item ${x.fixture.status.short}`} key={i}>
                            <p>{x.teams.home.name}</p>
                            <Input onChange={async e => await updateUserPredictions(x.fixture.id, true, e.target.value)} disabled={!canEdit} type="number" defaultValue={homePredictionForThisGame} />
                            <Input onChange={async e => await updateUserPredictions(x.fixture.id, false, e.target.value)} disabled={!canEdit} type="number" defaultValue={awayPredictionForThisGame} />
                            <p>{x.teams.away.name}</p>

                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>{moment(x.fixture.date).format('MMMM Do YYYY, h:mm:ss a')}</div>
                    </div>
                )
            })}
            <ToastContainer />
        </div>
    )
}

export default Predictions;