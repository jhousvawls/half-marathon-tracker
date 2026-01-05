import { ChevronsRight } from "lucide-react";

export default function EatCheatSheet() {
    const guides = [
        { type: 'Mexican', pick: 'Bowl or Tacos (corn)', avoid: 'Chips, Queso, Burritos' },
        { type: 'Italian', pick: 'Grilled fish, Red sauce pasta (small)', avoid: 'Bread basket, Cream sauce' },
        { type: 'Burger', pick: 'Single patty, no bun (or half), side salad', avoid: 'Fries, Double patties' },
        { type: 'BBQ', pick: 'Brisket, Smoked Chicken, Green Beans', avoid: 'Mac & Cheese, Toast' },
        { type: 'Thai', pick: 'Stir fry (light sauce), Summer rolls', avoid: 'Fried spring rolls, Heavy curry' },
    ];

    return (
        <div className="p-6 pb-24">
            <h1 className="text-2xl font-bold mb-2">Eating Out Guide</h1>
            <p className="text-gray-500 mb-6">Simple rules to stay on track.</p>

            <div className="bg-yellow-50 border-yellow-200 border rounded-xl p-4 mb-8">
                <h3 className="font-bold text-yellow-800 mb-2">Golden Rules</h3>
                <ul className="space-y-2 text-sm text-yellow-900">
                    <li className="flex gap-2"><ChevronsRight size={16} /> Pick a protein first</li>
                    <li className="flex gap-2"><ChevronsRight size={16} /> Add a veggie</li>
                    <li className="flex gap-2"><ChevronsRight size={16} /> Sauce on the side</li>
                    <li className="flex gap-2"><ChevronsRight size={16} /> Stop at 80% full</li>
                </ul>
            </div>

            <div className="space-y-4">
                {guides.map(g => (
                    <div key={g.type} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-2">{g.type}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-xs font-bold text-green-600 uppercase">Eat This</span>
                                {g.pick}
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-red-600 uppercase">Not That</span>
                                {g.avoid}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
