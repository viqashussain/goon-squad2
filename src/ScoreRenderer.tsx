export default function ScoreCellRenderer(props: any) {

    if (!props.value)
    {
        return null;
    }

    if (!props.value.goals)
    {
        return null;
    }

    const value = props.value
    const didArsenaDraw = value.goals.home === value.goals.away;
    let didArsenalWin = false;
    const arsenalIsHomeTeam = value.teams.home.id === 42;
    if (arsenalIsHomeTeam)
    {
        didArsenalWin = value.goals.home > value.goals.away;
    }
    else
    {
        didArsenalWin = value.goals.home < value.goals.away;
    }

    return (
        <div className={didArsenaDraw ? 'arsenal-drew' : didArsenalWin ? 'arsenal-won' : 'arsenal-lost'}>
            <img
                height='30px'
                style={{paddingRight: '10px'}}
                alt={value.teams.home.name}
                src={value.teams.home.logo}
            />
            <span>{value.teams.home.name}</span>
            <b> vs </b>
            <img
                height='30px'
                style={{paddingRight: '10px'}}
                alt={value.teams.away.name}
                src={value.teams.away.logo}
            />
            <span>{value.teams.away.name}</span>
            <span> - </span>
            <b>{value.goals.home} - {value.score.fulltime.away}</b>
        </div>
    )
}   