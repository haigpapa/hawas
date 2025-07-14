
import React from 'react';
import { GameState, PlayerData } from '../types';
import AidRewardModal from './AidRewardModal';
import { AID_COSTS } from '../constants';

interface GamePlayProps {
  gameState: GameState;
  playerData: PlayerData;
  currentLevel: number;
  currentQuestionNum: number;
  currentTopic: string;
  showResultsModal: boolean;
  showAidRewardModal: boolean;
  onAnswerSelect: (index: number) => void;
  onContinue: (returnHome: boolean) => void;
  onUseAid: (type: 'reveal' | 'narrow') => void;
  onClaimAid: (type: 'reveal' | 'narrow') => void;
  disabledAnswers: number[];
  currentHint: string | null;
  questionsPerRound: number;
}

interface ResultsModalProps {
  gameState: GameState;
  currentQuestionNum: number;
  questionsPerRound: number;
  onContinue: (returnHome: boolean) => void;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ gameState, currentQuestionNum, questionsPerRound, onContinue }) => {
  const isCorrect = gameState.selectedAnswer === gameState.currentQuestion?.correct_answer;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-end justify-center z-50 p-4">
      <div className="w-full max-w-md bg-black/80 border-t-2 border-white/20 rounded-t-3xl shadow-2xl transform animate-slide-up p-6">
        <div className={`text-center mb-6`}>
          <div className={`text-2xl font-bold font-mono mb-2 tracking-widest ${isCorrect ? 'text-cyan-400 animate-glow-accent' : 'text-slate-400'}`}>
            {isCorrect ? '[ صَوَاب ]' : '[ خَطَأ ]'}
          </div>
          <p className="text-slate-300 mb-4 text-lg">{isCorrect ? 'لقد أصبت مفصل الوهم' : 'خُدعت بوهم ذكي'}</p>
          <div className="text-sm text-slate-500 font-mono tracking-wider">QUESTION {currentQuestionNum} / {questionsPerRound}</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
             <div>
              <div className="text-2xl font-bold text-white font-mono">{gameState.score}</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest">Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{gameState.streak}</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest">Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{gameState.accuracy}%</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest">Accuracy</div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-right">
          <h4 className="font-semibold text-white mb-3">التفسير:</h4>
          <p className="text-slate-300 leading-relaxed text-sm">{gameState.currentQuestion?.explanation}</p>
        </div>

        <div className="flex gap-3 font-mono">
          <button onClick={() => onContinue(true)} className="flex-1 bg-white/10 text-white py-4 rounded-lg hover:bg-white/20 transition-colors">
            [ إنهاء الجولة ]
          </button>
          <button onClick={() => onContinue(false)} className="flex-1 bg-white text-black py-4 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
            <span>{currentQuestionNum >= questionsPerRound ? '[ إنهاء ]' : '[ التالي ]'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const GamePlay: React.FC<GamePlayProps> = (props) => {
  const { 
    gameState, playerData, currentLevel, currentQuestionNum, currentTopic, onAnswerSelect, 
    showResultsModal, showAidRewardModal, onClaimAid, onUseAid,
    disabledAnswers, currentHint, questionsPerRound
  } = props;

  if (!gameState.currentQuestion) {
    return null;
  }
  
  const hasAnswered = gameState.selectedAnswer !== null;

  return (
    <>
      <div className="min-h-screen bg-transparent p-4 sm:p-6 animate-fade-in relative z-10">
        <div className="max-w-2xl mx-auto">
          <header className="flex items-center justify-between mb-8 font-mono text-white/80 tracking-widest">
            <div>[ LVL {currentLevel} ]</div>
            <div>[ Q {currentQuestionNum}/{questionsPerRound} ]</div>
          </header>
          
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-white mb-4 leading-relaxed">{currentTopic}</h2>
            <p className="text-slate-400">اكتشف الوهم بين الحقائق</p>
          </div>

          <div className="flex gap-3 mb-6 font-mono justify-center">
            <button
              onClick={() => onUseAid('reveal')}
              disabled={hasAnswered || gameState.aids.reveal === 0 || playerData.xp < AID_COSTS.reveal}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              [ كَشْف ({gameState.aids.reveal}) | {AID_COSTS.reveal} XP ]
            </button>
            <button
              onClick={() => onUseAid('narrow')}
              disabled={hasAnswered || gameState.aids.narrow === 0 || playerData.xp < AID_COSTS.narrow}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              [ تَقْلِيص ({gameState.aids.narrow}) | {AID_COSTS.narrow} XP ]
            </button>
          </div>
          
          {currentHint && !hasAnswered && (
             <div className="bg-cyan-900/50 border border-cyan-400/30 rounded-lg p-3 text-center mb-6 animate-fade-in">
                <p className="text-cyan-300 text-sm">تلميح: {currentHint}</p>
             </div>
          )}


          <div className="space-y-3">
            {gameState.currentQuestion.statements.map((statement, index) => {
              const isSelected = gameState.selectedAnswer === index;
              const isCorrect = index === gameState.currentQuestion?.correct_answer;
              const isDisabledByAid = disabledAnswers.includes(index);

              let buttonClass = 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 text-slate-200';
              if (hasAnswered) {
                if (isCorrect) {
                  buttonClass = 'border-cyan-400 bg-cyan-500/20 text-white animate-glow-accent';
                } else if (isSelected && !isCorrect) {
                  buttonClass = 'border-red-500/50 bg-red-500/10 text-slate-300 scale-105';
                } else {
                  buttonClass = 'border-white/10 bg-white/5 text-slate-500 opacity-60';
                }
              } else if (isDisabledByAid) {
                buttonClass = 'border-white/10 bg-black/20 text-slate-600 opacity-50 cursor-not-allowed';
              }

              return (
                <button key={index} onClick={() => onAnswerSelect(index)} disabled={hasAnswered || isDisabledByAid} className={`w-full p-5 text-right border rounded-lg transition-all duration-300 ${buttonClass}`}>
                  <div className="flex items-start gap-4 justify-end">
                    <span className="text-lg leading-relaxed flex-1">{statement}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-1 transition-colors ${isSelected ? 'border-current' : 'border-white/30'}`}>
                      {isSelected && <div className="w-2 h-2 bg-current rounded-full"></div>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {showResultsModal && <ResultsModal gameState={props.gameState} currentQuestionNum={props.currentQuestionNum} questionsPerRound={props.questionsPerRound} onContinue={props.onContinue} />}
      {showAidRewardModal && <AidRewardModal onSelectAid={onClaimAid} />}
    </>
  );
};

export default GamePlay;