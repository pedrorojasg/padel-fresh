import { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { saveTournament } from '../../storage/localStorage';
import { generateSchedule } from '../../algorithm/americano';
import type { Tournament } from '../../types';
import StepName from './StepName';
import StepType from './StepType';
import StepPlayers from './StepPlayers';
import StepPointsCourts from './StepPointsCourts';
import StepReview from './StepReview';

export interface WizardState {
  step: number;
  name: string;
  type: 'classic_americano';
  players: string[];
  courts: string[];
  pointsPerRound: number;
  sitOutPoints: number;
  winBonus: number;
  drawBonus: number;
}

type WizardAction =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_TYPE'; payload: 'classic_americano' }
  | { type: 'ADD_PLAYER'; payload: string }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'SET_COURTS'; payload: string[] }
  | { type: 'SET_COURT_NAME'; payload: { index: number; name: string } }
  | { type: 'SET_POINTS_PER_ROUND'; payload: number }
  | { type: 'SET_SIT_OUT_POINTS'; payload: number }
  | { type: 'SET_WIN_BONUS'; payload: number }
  | { type: 'SET_DRAW_BONUS'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' };

function defaultCourts(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `Court ${i + 1}`);
}

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload };
    case 'SET_TYPE':
      return { ...state, type: action.payload };
    case 'ADD_PLAYER':
      if (state.players.includes(action.payload)) return state;
      return { ...state, players: [...state.players, action.payload] };
    case 'REMOVE_PLAYER':
      return { ...state, players: state.players.filter((p) => p !== action.payload) };
    case 'SET_COURTS': {
      const newCourts = action.payload;
      return { ...state, courts: newCourts };
    }
    case 'SET_COURT_NAME': {
      const courts = [...state.courts];
      courts[action.payload.index] = action.payload.name;
      return { ...state, courts };
    }
    case 'SET_POINTS_PER_ROUND':
      return { ...state, pointsPerRound: action.payload };
    case 'SET_SIT_OUT_POINTS':
      return { ...state, sitOutPoints: action.payload };
    case 'SET_WIN_BONUS':
      return { ...state, winBonus: action.payload };
    case 'SET_DRAW_BONUS':
      return { ...state, drawBonus: action.payload };
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1 };
    case 'PREV_STEP':
      return { ...state, step: Math.max(0, state.step - 1) };
    default:
      return state;
  }
}

const initialState: WizardState = {
  step: 0,
  name: '',
  type: 'classic_americano',
  players: [],
  courts: defaultCourts(2),
  pointsPerRound: 24,
  sitOutPoints: 0,
  winBonus: 0,
  drawBonus: 0,
};

export default function CreateTournament() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleClose = () => navigate('/');

  const buildTournament = (status: 'draft' | 'active'): Tournament => {
    const rounds = status === 'active' ? generateSchedule(state.players, state.courts.length) : [];
    return {
      id: uuidv4(),
      name: state.name,
      type: state.type,
      createdAt: new Date().toISOString(),
      status,
      players: state.players,
      courts: state.courts,
      pointsPerRound: state.pointsPerRound,
      sitOutPoints: state.sitOutPoints,
      winBonus: state.winBonus,
      drawBonus: state.drawBonus,
      rounds,
    };
  };

  const handleSaveDraft = () => {
    const t = buildTournament('draft');
    saveTournament(t);
    navigate('/');
  };

  const handleCreate = () => {
    const t = buildTournament('active');
    saveTournament(t);
    navigate(`/tournament/${t.id}`);
  };

  const steps = [
    <StepName key="name" state={state} dispatch={dispatch} onClose={handleClose} />,
    <StepType key="type" state={state} dispatch={dispatch} onClose={handleClose} />,
    <StepPlayers key="players" state={state} dispatch={dispatch} onClose={handleClose} />,
    <StepPointsCourts key="points" state={state} dispatch={dispatch} onClose={handleClose} />,
    <StepReview
      key="review"
      state={state}
      dispatch={dispatch}
      onClose={handleClose}
      onSaveDraft={handleSaveDraft}
      onCreate={handleCreate}
    />,
  ];

  return <div className="min-h-screen bg-black">{steps[state.step]}</div>;
}
