import { useState } from 'react';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentMethodsProps {
  userType: 'guest' | 'free' | 'pro' | 'enterprise';
}

interface Card {
  id: string;
  brand: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expMonth: string;
  expYear: string;
  isDefault: boolean;
}

export function PaymentMethods({ userType }: PaymentMethodsProps) {
  const [cards, setCards] = useState<Card[]>(
    userType === 'pro'
      ? [
        {
          id: '1',
          brand: 'visa',
          last4: '4242',
          expMonth: '12',
          expYear: '2026',
          isDefault: true,
        },
      ]
      : []
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [password, setPassword] = useState('');

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join('-') || cleaned;
    return formatted.slice(0, 19); // XXXX-XXXX-XXXX-XXXX
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleAddCard = () => {
    if (!cardNumber || !expiry || !cvc || !password) {
      toast.error('모든 필드를 입력해주세요');
      return;
    }

    const cleanedNumber = cardNumber.replace(/\D/g, '');
    if (cleanedNumber.length !== 16) {
      toast.error('올바른 카드 번호를 입력해주세요');
      return;
    }

    if (expiry.length !== 5) {
      toast.error('올바른 유효기간을 입력해주세요 (MM/YY)');
      return;
    }

    if (cvc.length !== 3) {
      toast.error('올바른 CVC를 입력해주세요');
      return;
    }

    if (password.length !== 2) {
      toast.error('비밀번호 앞 2자리를 입력해주세요');
      return;
    }

    // Mock card addition
    const newCard: Card = {
      id: Date.now().toString(),
      brand: 'visa',
      last4: cleanedNumber.slice(-4),
      expMonth: expiry.slice(0, 2),
      expYear: '20' + expiry.slice(3, 5),
      isDefault: cards.length === 0,
    };

    setCards([...cards, newCard]);
    setShowAddForm(false);
    setCardNumber('');
    setExpiry('');
    setCvc('');
    setPassword('');
    toast.success('카드가 등록되었습니다');
  };

  const handleDeleteCard = (id: string) => {
    if (confirm('이 카드를 삭제하시겠습니까?')) {
      setCards(cards.filter((card) => card.id !== id));
      toast.success('카드가 삭제되었습니다');
    }
  };

  const getCardBrandLogo = (brand: string) => {
    switch (brand) {
      case 'visa':
        return (
          <svg className="h-8" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#1434CB" />
            <path d="M20.5 11.5h-3l-2 12h3l2-12zm8.5 7.8l1.5-4.2 1 4.2h-2.5zm3.5 4.2h2.8l-2.5-12h-2.5l-3.8 12h2.8l.7-2h4l.5 2zm-9-8.3c0-1.5 1.9-1.9 3.3-1.9.7 0 1.8.2 2.5.5l.5-2.3c-.8-.3-1.8-.5-3-.5-3.2 0-5.5 1.7-5.5 4.2 0 1.8 1.6 2.8 2.8 3.4 1.3.6 1.7.9 1.7 1.4 0 .8-.9 1.1-1.8 1.1-1.5 0-2.3-.2-3.5-.7l-.5 2.4c.8.4 2.3.7 3.8.7 3.4 0 5.7-1.7 5.7-4.3 0-3.4-4.7-3.6-4.7-5z" fill="white" />
          </svg>
        );
      case 'mastercard':
        return (
          <svg className="h-8" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#EB001B" />
            <circle cx="18" cy="16" r="10" fill="#FF5F00" />
            <circle cx="30" cy="16" r="10" fill="#F79E1B" />
            <path d="M24 7.5c-2.5 2-4 5-4 8.5s1.5 6.5 4 8.5c2.5-2 4-5 4-8.5s-1.5-6.5-4-8.5z" fill="#FF5F00" />
          </svg>
        );
      default:
        return (
          <svg className="h-8" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#0066B2" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Registered Cards */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-gray-900">등록된 카드</h2>
          <p className="text-sm text-gray-500 mt-1">
            결제에 사용할 카드를 관리하세요
          </p>
        </div>

        {cards.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">등록된 카드가 없습니다</h3>
            <p className="text-sm text-gray-500 mb-4">
              결제 수단을 추가하여 간편하게 결제하세요
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg overflow-hidden"
              >
                {/* Card pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />

                <div className="relative">
                  <div className="flex items-start justify-between mb-8">
                    {getCardBrandLogo(card.brand)}
                    {card.isDefault && (
                      <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                        기본 카드
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">카드 번호</p>
                      <p className="text-xl tracking-wider">
                        •••• •••• •••• {card.last4}
                      </p>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">유효기간</p>
                        <p className="text-sm">{card.expMonth}/{card.expYear.slice(-2)}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Card Form */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-gray-900">새 카드 등록</h3>
              <p className="text-sm text-gray-500">결제 수단 추가하기</p>
            </div>
          </div>
        </button>

        {showAddForm && (
          <div className="p-6 border-t space-y-4">
            <div>
              <label className="text-gray-700 mb-2 block">카드 번호</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="1234-5678-9012-3456"
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-gray-700 mb-2 block">유효기간</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>

              <div>
                <label className="text-gray-700 mb-2 block">CVC</label>
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="123"
                  maxLength={3}
                />
              </div>

              <div>
                <label className="text-gray-700 mb-2 block">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddCard}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                등록
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900">
          🔒 모든 결제 정보는 안전하게 암호화되어 저장됩니다
        </p>
      </div>
    </div>
  );
}
