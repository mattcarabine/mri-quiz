import { QuizContainer } from './components/quiz/QuizContainer';

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <main className="max-w-6xl mx-auto">
          <QuizContainer />
        </main>
      </div>
    </div>
  );
}

export default App;
