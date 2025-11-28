'use client';

import { X } from 'lucide-react';

interface TermsModalProps {
    type: 'service' | 'privacy';
    onClose: () => void;
}

export function TermsModal({ type, onClose }: TermsModalProps) {
    const isService = type === 'service';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-gray-900">
                        {isService ? '서비스 이용약관' : '개인정보 수집 및 이용 동의'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 overflow-y-auto max-h-[calc(85vh-80px)] space-y-4">
                    {isService ? (
                        <>
                            <section>
                                <h4 className="text-gray-900 mb-2">제1조 (목적)</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    본 약관은 Promit(이하 &quot;회사&quot;)가 제공하는 프롬프트 관리 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                                </p>
                            </section>

                            <section>
                                <h4 className="text-gray-900 mb-2">제2조 (용어의 정의)</h4>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-2">
                                    <p>1. &quot;서비스&quot;란 회원이 프롬프트를 생성, 저장, 관리 및 실행할 수 있는 웹 기반 플랫폼을 의미합니다.</p>
                                    <p>2. &quot;회원&quot;이란 본 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 말합니다.</p>
                                    <p>3. &quot;프롬프트&quot;란 회원이 서비스를 통해 생성, 저장하는 텍스트 기반 작업 지시문을 의미합니다.</p>
                                    <p>4. &quot;Guest&quot;란 회원가입 없이 로컬스토리지 기반으로 제한적 서비스를 이용하는 자를 말합니다.</p>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-gray-900 mb-2">제3조 (약관의 효력 및 변경)</h4>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-2">
                                    <p>1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.</p>
                                    <p>2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할 수 있습니다.</p>
                                    <p>3. 회원은 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</p>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-gray-900 mb-2">제4조 (서비스의 제공 및 변경)</h4>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-2">
                                    <p>1. 회사는 다음과 같은 서비스를 제공합니다:</p>
                                    <p className="pl-4">- 프롬프트 생성, 저장, 수정, 삭제 기능</p>
                                    <p className="pl-4">- P.A.I.R 프레임워크 기반 프롬프트 작성 지원</p>
                                    <p className="pl-4">- 변수 치환 기반 프롬프트 실행</p>
                                    <p className="pl-4">- 리스트 및 칸반 뷰 제공</p>
                                    <p>2. 회사는 서비스의 내용을 변경할 수 있으며, 이 경우 변경 내용을 사전에 공지합니다.</p>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-gray-900 mb-2">제5조 (회원의 의무)</h4>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-2">
                                    <p>1. 회원은 다음 행위를 하여서는 안 됩니다:</p>
                                    <p className="pl-4">- 타인의 정보 도용</p>
                                    <p className="pl-4">- 회사가 게시한 정보의 변경</p>
                                    <p className="pl-4">- 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</p>
                                    <p className="pl-4">- 회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</p>
                                    <p>2. 회원은 관계법령, 본 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항을 준수하여야 합니다.</p>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-gray-900 mb-2">제6조 (서비스 이용의 제한)</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    회사는 회원이 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.
                                </p>
                            </section>

                            <section>
                                <h4 className="text-gray-900 mb-2">제7조 (면책조항)</h4>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-2">
                                    <p>1. 회사는 천재지변, 전쟁 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
                                    <p>2. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</p>
                                    <p>3. 회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖에 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</p>
                                </div>
                            </section>
                        </>
                    ) : (
                        <>
                            <section>
                                <h4 className="text-gray-900 mb-2">1. 수집하는 개인정보 항목</h4>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-2">
                                    <p>회사는 회원가입, 서비스 제공을 위해 아래와 같은 개인정보를 수집하고 있습니다:</p>
                                    <p className="pl-4">- 필수항목: 이메일 주소, 이름, 비밀번호(암호화 저장)</p>
                                    <p className="pl-4">- 선택항목: 마케팅 수신 동의 여부</p>
                                    <p className="pl-4">- 자동수집: 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보</p>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-gray-900 mb-2">2. 개인정보의 수집 및 이용 목적</h4>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-2">
                                    <p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다:</p>
                                    <p className="pl-4">- 서비스 제공 및 회원 관리</p>
                                    <p className="pl-4">- 본인 확인 및 인증</p>
                                    <p className="pl-4">- 서비스 개선 및 신규 서비스 개발</p>
                                    <p className="pl-4">- 마케팅 및 광고 활용 (동의 시에만)</p>
                                    <p className="pl-4">- 법령 및 이용약관을 위반하는 회원에 대한 이용 제한 조치</p>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-gray-900 mb-2">3. 개인정보의 보유 및 이용 기간</h4>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-2">
                                    <p>회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다:</p>
                                    <p className="pl-4">- 회원 탈퇴 시: 부정 이용 방지를 위해 30일간 보관 후 파기</p>
                                    <p className="pl-4">- 관련 법령에 의한 정보보유 사유</p>
                                    <p className="pl-6">• 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</p>
                                    <p className="pl-6">• 대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</p>
                                    <p className="pl-6">• 소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</p>
                                    <p className="pl-6">• 접속에 관한 기록: 3개월 (통신비밀보호법)</p>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-gray-900 mb-2">4. 개인정보의 제3자 제공</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    회사는 원칙적으로 회원의 개인정보를 제3자에게 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다:
                                </p>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-2 mt-2">
                                    <p className="pl-4">- 회원이 사전에 동의한 경우</p>
                                    <p className="pl-4">- 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</p>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-gray-900 mb-2">5. 개인정보의 파기 절차 및 방법</h4>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-2">
                                    <p>회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다:</p>
                                    <p className="pl-4">- 파기절차: 회원이 입력한 정보는 목적 달성 후 별도의 DB로 옮겨져 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라 일정 기간 저장된 후 파기됩니다.</p>
                                    <p className="pl-4">- 파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다. 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각합니다.</p>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-gray-900 mb-2">6. 회원의 권리</h4>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-2">
                                    <p>회원은 언제든지 다음의 권리를 행사할 수 있습니다:</p>
                                    <p className="pl-4">- 개인정보 열람 요구</p>
                                    <p className="pl-4">- 오류 정정 요구</p>
                                    <p className="pl-4">- 삭제 요구</p>
                                    <p className="pl-4">- 처리정지 요구</p>
                                    <p>위 권리 행사는 서비스 내 설정 메뉴를 통해 직접 처리하거나, 고객센터를 통해 요청할 수 있습니다.</p>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-gray-900 mb-2">7. 개인정보 보호책임자</h4>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-2">
                                    <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:</p>
                                    <p className="pl-4 mt-2">- 개인정보 보호책임자</p>
                                    <p className="pl-6">성명: Promit 관리자</p>
                                    <p className="pl-6">이메일: privacy@promit.com</p>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-gray-900 mb-2">8. 개인정보 처리방침 변경</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    본 개인정보 처리방침은 2025년 11월 28일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                                </p>
                            </section>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}
