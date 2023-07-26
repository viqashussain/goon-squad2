import React, { useCallback, useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { render } from 'react-dom';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';

import { LicenseManager } from "ag-grid-enterprise";
import { Prediction, RawUserPrediction } from './types/prediction';
import ScoreCellRenderer from './ScoreRenderer';
import { getArsenalFixturesForCurrentSeason } from './ArsenalService';
import { auth, db } from './firebase';
import { getDocs, query, collection } from 'firebase/firestore';
import { CircularProgress } from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Loading } from './Loading';
LicenseManager.setLicenseKey("CompanyName=T/A Viqas Hussain,LicensedGroup=T/A Viqas Hussain,LicenseType=MultipleApplications,LicensedConcurrentDeveloperCount=1,LicensedProductionInstancesCount=1,AssetReference=AG-016245,ExpiryDate=9_June_2022_[v2]_MTY1NDcyOTIwMDAwMA==1fe1806f4c1833622bb983af6ef92aeb");

function Table() {

    const [rawUserPredictions, setRawUserPredictions] = useState<RawUserPrediction[]>([]);
    const [predictions, setPredictions] = useState<Prediction[]>();
    const [arsenalFixtures, setArsenalFixtures] = useState<[]>([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [pinnedBottomRowData, setPinnedBottomRowData] = useState([]);
    const gridRef = useRef();
    const [user, loading] = useAuthState(auth);

    useEffect(() => {
        const fetchData = async () => {
            await getScorePredictions();
            let arsenalFixtures = await getArsenalFixturesForCurrentSeason();

            // you only want current or previous fixtures and PL fixtures
            // also not matches that have been postponed
            arsenalFixtures = arsenalFixtures.filter(x => x.league.id === 39);
            await setArsenalFixtures(arsenalFixtures);
        }
        fetchData()
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (rawUserPredictions.length && arsenalFixtures.length) {
            createColumnDefs();
            computePredictionsForTable();
        }
    }, [rawUserPredictions, arsenalFixtures]);

    // const [columnDefs] = useState([
    //   { field: 'username', enableRowGroup: true },
    //   { field: 'points', enableValue: true, },
    //   { field: 'scorePrediction' },
    //   { field: 'fixture', headerName: 'score', cellRenderer: 'scoreCellRenderer' }
    // ])

    const frameworkComponents = {
        scoreCellRenderer: ScoreCellRenderer,
    };

    const createColumnDefs = () => {
        const uniqueUsers = new Set([...rawUserPredictions.map(x => x.user)]);
        const cds: any = [
            { field: 'fixture', headerName: 'Fixture', cellRenderer: 'scoreCellRenderer', minWidth: 500 }
        ];

        uniqueUsers.forEach(x => {
            cds.push(
                {
                    field: x.substr(0, x.indexOf('@')), cellClassRules: cellClassRulesForScorePrediction,
                    // used for the bottom pinned row
                    cellStyle: params => {
                        if (params.node.rowPinned === 'bottom') {
                            const uniqueTopScores = Array.from(new Set([...Object.values(params.data)])).sort();
                            const index = uniqueTopScores.indexOf(params.value);

                            if (index === uniqueTopScores.length - 1) {
                                return { backgroundColor: '#00e600' }
                            }

                            // console.log(getColor())
                            // return { 'backgroundColor': '#' + generateColor('red', 'green', uniqueTopScores.length)[index] };
                        }
                    }
                }
            );
        });

        setColumnDefs(cds);
    }

    const cellClassRulesForScorePrediction = {
        "cell-green": params => {
            if (params.value && params.node.rowPinned !== 'bottom') {
                return params.value.substr(0, 1) == 5;
            }
        },
        "cell-amber": params => {
            if (params.value && params.node.rowPinned !== 'bottom') {
                return params.value.substr(0, 1) == 3
            }
        },
        "cell-red": params => {
            if (params.value && params.node.rowPinned !== 'bottom') {
                return params.value.substr(0, 1) == 0
            }
        },
    };

    const getScorePredictions = async () => {
        const q = query(collection(db, "predictions"));
        const doc = await getDocs(q);
        const data = doc.docs.map(x => x.data());
        await setRawUserPredictions(data as any);
    }

    const getPointsForFixture = (x: RawUserPrediction, fixture: any): string => {
        // only get score for games finished
        if (fixture.fixture.status.short !== 'FT') {
            return 'N/A';
        }
        let points = 0;
        // user predicted correct scoreline
        if (x.home === fixture.goals.home && x.away === fixture.goals.away) {
            points = 5;
        }
        // draw
        else if (fixture.goals.home === fixture.goals.away && x.home === x.away) {
            points = 3;
        }
        else 
        {
            const didUserPredictHomeWin = x.home > x.away;
            const didHomeTeamWin = fixture.goals.home > fixture.goals.away;

            const didUserPredictAwayWin = x.away > x.home;
            const didAwayTeamWin = fixture.goals.away > fixture.goals.home;

            if (didUserPredictHomeWin && didHomeTeamWin) {
                points = 3;
            }
            else if (didUserPredictAwayWin && didAwayTeamWin)
            {
                points = 3;
            }
        }
        return points.toString();
    }

    const computePredictionsForTable = () => {
        console.log((arsenalFixtures as any))
        const finalList: Prediction[] = [];
        const uniqueUsers = new Set([...rawUserPredictions.map(x => x.user)]);
        const totalPointsForUser = {};

        arsenalFixtures.forEach((x: any) => {
            let prediction: any = {
                fixture: x,
            };

            uniqueUsers.forEach((u: any) => {
                const userPrediction = rawUserPredictions.find(up => up.user === u && up.fixtureId === x.fixture.id);
                if (userPrediction) {
                    const points = getPointsForFixture(userPrediction, x);
                    prediction[u.substr(0, u.indexOf('@'))] = `${points} (${userPrediction.home} - ${userPrediction.away})`;

                    if (!isNaN(parseInt(points))) {
                        const pointsInt = parseInt(points);
                        totalPointsForUser[u.substr(0, u.indexOf('@'))] = totalPointsForUser[u] ? totalPointsForUser[u] += pointsInt : totalPointsForUser[u] = pointsInt;
                    }
                }
            });
            finalList.push(prediction);
            (gridRef as any).current.api.sizeColumnsToFit();
        })

        setPinnedBottomRowData([totalPointsForUser]);



        // let prediction: Prediction = {
        //   scorePrediction: `${x.home} - ${x.away}`,
        //   username: x.user,
        //   points: points,
        //   fixture: fixture
        // };
        console.log(finalList);
        setPredictions(finalList);
    }

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <div className="App">
            <h1>
                Table
            </h1>

            <div className="gridDiv ag-theme-alpine">
                <AgGridReact
                    ref={gridRef}
                    frameworkComponents={frameworkComponents}
                    pinnedBottomRowData={pinnedBottomRowData}
                    rowData={predictions}
                    columnDefs={columnDefs}>
                </AgGridReact>
            </div>
        </div>
    );
}

export default Table;

function getColor(value) {
    //value from 0 to 1
    var hue = ((1 - value) * 120).toString(10);
    return ["hsl(", hue, ",100%,50%)"].join("");
}
