import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './PaymentPage.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { buyNowProduct } = location.state || {}; // 바로 구매 상품

  const { cartItems, loading, cartTotal, clearCart } = useCart();

  // 결제할 상품 목록 (바로 구매 상품이 있으면 그것을 사용, 없으면 장바구니 상품 사용)
  const productsToPay = buyNowProduct ? [buyNowProduct] : cartItems;

  // 총 결제 금액 계산 (바로 구매 상품이 있으면 그것의 금액, 없으면 장바구니 총액)
  const calculatedTotalAmount = buyNowProduct ? (buyNowProduct.price * buyNowProduct.quantity) : cartTotal;

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    detailAddress: '',
    zipCode: '',
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (!loading && productsToPay.length === 0) {
      alert('결제할 상품이 없습니다. 상품을 담아주세요.');
      navigate('/'); // 상품이 없으면 홈으로 리다이렉트
    }
  }, [productsToPay, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalAmount = calculatedTotalAmount;
  const shippingFee = 3000; // 예시 배송비
  const finalPaymentAmount = totalAmount + shippingFee;

  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleAgreeToTerms = () => {
    setAgreedToTerms(!agreedToTerms);
  };

  const handlePayment = () => {
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.zipCode) {
      alert('배송 정보를 모두 입력해주세요.');
      return;
    }
    if (!selectedPaymentMethod) {
      alert('결제 수단을 선택해주세요.');
      return;
    }
    if (!agreedToTerms) {
      alert('주문 내용을 확인하고 약관에 동의해주세요.');
      return;
    }

    alert('결제가 완료되었습니다!');

    // 트랜잭션 객체 생성
    const newTransaction = {
      id: `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // 고유 ID 생성
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD 형식
      products: productsToPay.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl,
      })),
      shippingInfo: shippingInfo,
      amount: finalPaymentAmount,
      paymentMethod: selectedPaymentMethod,
      status: '결제 완료', // 초기 상태
    };

    // localStorage에서 기존 트랜잭션 불러오기
    const existingTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
    // 새 트랜잭션을 기존 목록에 추가
    const updatedTransactions = [newTransaction, ...existingTransactions];
    // localStorage에 업데이트된 트랜잭션 목록 저장
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

    // 장바구니를 통해 결제한 경우에만 장바구니 비우기
    if (!buyNowProduct) {
      clearCart();
    }

    navigate('/purchasesales'); // 결제 성공 시, 구매 내역 페이지로 이동
  };

  return (
    <div className="payment-page">
      <main className="payment-main">
        <h1 className="page-title">결제하기</h1>

        <div className="payment-section order-summary-section">
          <h2 className="section-title">주문 상품</h2>
          <div className="order-items-list">
            {productsToPay.map((item) => (
              <div key={item.id} className="order-item">
                <img src={item.imageUrl} alt={item.name} className="order-item-image" />
                <div className="order-item-details">
                  <span className="order-item-name">{item.name}</span>
                  <span className="order-item-quantity">{item.quantity}개</span>
                  <span className="order-item-price">{(item.price * item.quantity).toLocaleString()}원</span>
                </div>
              </div>
            ))}
          </div>
          <div className="summary-details">
            <div className="summary-row">
              <span>총 상품 금액</span>
              <span>{totalAmount.toLocaleString()}원</span>
            </div>
            <div className="summary-row">
              <span>배송비</span>
              <span>{shippingFee.toLocaleString()}원</span>
            </div>
            <div className="summary-total-amount">
              <span>총 결제 금액</span>
              <span>{finalPaymentAmount.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        <div className="payment-section shipping-info-section">
          <h2 className="section-title">배송 정보</h2>
          <div className="shipping-form">
            <input
              type="text"
              name="name"
              placeholder="이름"
              value={shippingInfo.name}
              onChange={handleShippingInfoChange}
            />
            <input
              type="text"
              name="phone"
              placeholder="연락처"
              value={shippingInfo.phone}
              onChange={handleShippingInfoChange}
            />
            <input
              type="text"
              name="zipCode"
              placeholder="우편번호"
              value={shippingInfo.zipCode}
              onChange={handleShippingInfoChange}
            />
            <input
              type="text"
              name="address"
              placeholder="주소"
              value={shippingInfo.address}
              onChange={handleShippingInfoChange}
            />
            <input
              type="text"
              name="detailAddress"
              placeholder="상세 주소 (선택 사항)"
              value={shippingInfo.detailAddress}
              onChange={handleShippingInfoChange}
            />
          </div>
        </div>

        <div className="payment-section payment-method-section">
          <h2 className="section-title">결제 수단</h2>
          <div className="payment-methods-grid">
            <Button
              variant="outline"
              className={`payment-method-button ${selectedPaymentMethod === '삼성페이' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodSelect('삼성페이')}
            >
              <img src="/src/assets/images/samsung_pay.png" alt="삼성페이" />
              <span>삼성페이</span>
            </Button>
            <Button
              variant="outline"
              className={`payment-method-button ${selectedPaymentMethod === '애플페이' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodSelect('애플페이')}
            >
              <img src="/src/assets/images/apple_pay.jpg" alt="애플페이" />
              <span>애플페이</span>
            </Button>
            <Button
              variant="outline"
              className={`payment-method-button ${selectedPaymentMethod === '네이버페이' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodSelect('네이버페이')}
            >
              <img src="/src/assets/images/naver_pay.jpg" alt="네이버페이" />
              <span>네이버페이</span>
            </Button>
            <Button
              variant="outline"
              className={`payment-method-button ${selectedPaymentMethod === '카카오페이' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodSelect('카카오페이')}
            >
              <img src="/src/assets/images/kakao_pay.jpg" alt="카카오페이" />
              <span>카카오페이</span>
            </Button>
            {/* 추가 결제 수단 (신용카드, 계좌이체 등) */}
            <Button
              variant="outline"
              className={`payment-method-button ${selectedPaymentMethod === '신용카드' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodSelect('신용카드')}
            >
              <span>신용카드</span>
            </Button>
            <Button
              variant="outline"
              className={`payment-method-button ${selectedPaymentMethod === '계좌이체' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodSelect('계좌이체')}
            >
              <span>계좌이체</span>
            </Button>
          </div>
        </div>

        <div className="payment-section terms-agreement-section">
          <h2 className="section-title">약관 동의</h2>
          <label className="terms-checkbox">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={handleAgreeToTerms}
            />
            <span>주문 내용을 확인하였으며, 약관에 동의합니다.</span>
          </label>
        </div>

        <div className="payment-final-action">
          <Button className="pay-button" onClick={handlePayment}>
            {finalPaymentAmount.toLocaleString()}원 결제하기
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PaymentPage;
