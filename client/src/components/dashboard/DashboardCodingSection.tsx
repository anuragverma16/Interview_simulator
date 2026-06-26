import { Link } from 'react-router-dom';
import { Code2, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FadeInUp from '../animations/FadeInUp';

export default function DashboardCodingSection() {
  return (
    <FadeInUp delay={0.15}>
      <Card className="!p-6 border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Practice Problems</h3>
              <p className="text-sm text-muted mt-1">
                Browse 3000+ LeetCode-style problems — easy, medium, and hard. Filter by topic and run real test cases.
              </p>
            </div>
          </div>
          <Link to="/coding">
            <Button size="lg" className="whitespace-nowrap">
              Open Problem Set <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </FadeInUp>
  );
}
