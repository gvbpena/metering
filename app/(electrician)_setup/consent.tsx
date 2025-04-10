import React, { useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import StackScreen from "./_stackscreen";
export default function ConsentPage() {
    const [agreement, setAgreement] = useState<boolean | null>(null);
    return (
        <>
            <StackScreen title="Consent" nextRoute="consent_signature_setup" nextLabel="Next" onNext={() => !!agreement} />

            <ScrollView>
                <View className="flex-1 bg-white px-6 pt-10">
                    <Text className="text-xl text-gray-700 leading-relaxed">
                        Here at
                        <Text className="font-semibold"> Davao Light and Power Company, Inc.</Text>
                        {"\n"}(the "Company"), we believe in protecting the privacy of your personal information. For this reason, and in compliance with the
                        Data Privacy Act of 2012, the Company would like to inform you about how we process your information related to your application for an
                        electric service connection.
                        {"\n"}
                        {"\n"}
                        <Text className="font-medium">1. Consent to Process Personal Information</Text>
                        {"\n"}
                        You agree and consent that the Company may collect, receive, have access to, record, organize, store, consult, use, or handle your
                        Personal Information provided or to which access was provided to the Company by you or at your direction, in connection with your
                        application for an electric service connection, your Electric Service Contract (the "Contract") with the Company, or in the course of
                        performing all obligations under the Contract and applicable law and regulations.
                        {"\n"}
                        Ni-uyon ug nihatag ka sa imong pagtugot nga ang Kompaniya mahimong mokolekta, modawat, makabaton ug katungod sa pagsusi, motala,
                        mo-organisa, motip-ig o mohipos, mokunsulta, mogamit o modumala sa Personal nga Inpormasyon nga imong gitugyan sa Kompaniya, kabahin sa
                        imong aplikasyon para sa serbisyo sa kuryente, sa imong kontrata sa Serbisyo sa Kuryente ("Kontrata") uban sa Kompaniya, o sa pagtuman
                        sa tanang mga obligasyon diha sa Kontrata ug sa balaod ug regulasyon.
                        {"\n"}
                        {"\n"}
                        <Text className="font-medium">2. Purpose of Processing Personal Information</Text>
                        {"\n"}
                        You agree and consent that the Company may collect, receive, record, store, use, handle, process, transmit, and file your Personal
                        Information, in paper or electronic form, manually or through an automated system, for the following purposes:
                        {"\n"}
                        Ni-uyon ug nihatag ka sa imong pagtugot nga ang Kompaniya mahimong mokolekta, modawat, motala, motip-ig, mogamit, modumala, moproseso,
                        mopadala ug mohan-ay sa imong Personal nga Inpormasyon diha sa papel o pormang elektronik, o sa manwal or otomatikong pamaagi, alang
                        niining mosunod nga katuyuan:
                        {"\n"}
                        {"\n"}
                        2.1 To assess your continued qualification for service connection.
                        {"\n"}
                        Alang sa pagtimbang-timbang sa imong nagpadayong kwalipikasyon sa serbisyo sa kuryente.
                        {"\n"}
                        {"\n"}
                        2.2 To manage your service connection and account.
                        {"\n"}
                        Alang sa pagdumala sa serbisyo sa kuryente o akawnt.
                        {"\n"}
                        {"\n"}
                        2.3 To check any requirement in support of your service connection.
                        {"\n"}
                        Alang sa pagsusi sa bisan unsa pang kinahanglanon kabahin sa serbisyo sa kuryente.
                        {"\n"}
                        {"\n"}
                        2.4 To maintain or update the Company’s customer records.
                        {"\n"}
                        Alang sa pagmintinar ug sa pagbago (update) sa rekord sa mga kustomer sa Kompaniya.
                        {"\n"}
                        {"\n"}
                        2.5 To manage the Company’s relationship with you, such as updating you on the Company’s activities or other services which may interest
                        you.
                        {"\n"}
                        Alang sa pagdumala sa relasyon sa Kompaniya tali kanimo, sama sa pagpahibalo kanimo sa mga bag-ong kalihokan sa Kompaniya o sa uban pang
                        mga serbisyo nga mahimong makapa-interes kanimo.
                        {"\n"}
                        {"\n"}
                        2.6 For statistical and analytical studies and internal reporting.
                        {"\n"}
                        Alang sa statistical ug matukiong pagtuon, ug internal reporting.
                        {"\n"}
                        {"\n"}
                        2.7 To identify you or verify your identity and your account.
                        {"\n"}
                        Alang sa pag-ila kanimo o pagsuta sa imong pagkatawo o sa imong akawnt.
                        {"\n"}
                        {"\n"}
                        2.8 To contact you with regard to your account.
                        {"\n"}
                        Alang sa pagkontak kanimo kabahin sa imong akawnt.
                        {"\n"}
                        {"\n"}
                        2.9 As required under applicable law or regulation or by any decision or order of any court or government agency.
                        {"\n"}
                        Alang sa pagtuman sa mga gikinahanglan ubos sa balaod o regulasyon o bisan unsang desisyon o mando sa bisan unsang korte o ahensya sa
                        gobyerno.
                        {"\n"}
                        {"\n"}
                        <Text className="font-medium">3. Sharing of Personal Information</Text>
                        {"\n"}
                        Your Personal Information may be shared with other companies belonging to the Aboitiz Group for statistical and analytical studies as
                        well as to inform you of the Aboitiz Group’s activities or offer you other services or products which may interest you.
                        {"\n"}
                        Ang imong Personal nga Inpormasyon mamahimong mahatag sa ubang kompaniya nga sakop sa Aboitiz Group para sa statistikal ug analitikal
                        nga pagtuon ingon man usab para sa pagpahibalo kanimo sa mga kalihukan sa Aboitiz Group o uban pang serbisyo o produkto nga
                        makapainteres kanimo.
                        {"\n"}
                        {"\n"}
                        <Text className="font-medium">4. Disclosure of Personal Information</Text>
                        {"\n"}
                        You agree and consent that the Company may disclose your Personal Information to:
                        {"\n"}
                        {"\n"}
                        4.1 Any collection agency, payment center, or similar service providers to facilitate the collection of service fees, monitoring
                        outstanding obligations, or preventing any fraud.
                        {"\n"}
                        Bisan unsang ahensya nga tigkolekta, mga bayad centers, o uban pang lugar nga may susamang serbisyo, aron mapasayon ang pagkolekta sa
                        mga bayronon sa serbisyo kuryente, ang pag-monitor sa mga obligasyon, o pagsanta sa bisan unsang pagpanlimbong.
                        {"\n"}
                        {"\n"}
                        4.2 Any meter reading provider, electric services contractor, or other service providers engaged by the Company to exercise its rights
                        or perform its obligations under the Contract.
                        {"\n"}
                        Mga kontraktor nga tigbasa og metro sa kuryente, kontraktor sa serbisyo elektrikal, o uban pang maghahatag ug serbisyo nga gisangonan sa
                        Kompaniya aron sa pagpatuman sa mga katungod ug obligasyon sa Kompaniya ubos sa Kontrata.
                        {"\n"}
                        {"\n"}
                        <Text className="font-medium">5. Contact Information</Text>
                        {"\n"}
                        You may send a written request or letter to the Company regarding your rights as a Data Subject to:
                        {"\n"}
                        {"\n"}
                        <Text className="font-medium">The Data Protection Officer</Text>
                        {"\n"}
                        Davao Light and Power Co., Inc.
                        {"\n"}
                        C. Bangoy Sr. Street, Davao City, Philippines 8000
                        {"\n"}
                        Phone: 229-3553
                        {"\n"}
                        Email: dlpc.dpo@aboitiz.com
                        {"\n"}
                        {"\n"}
                        To process your request, the Company may charge a reasonable fee.
                        {"\n"}
                        {"\n"}
                        <Text className="font-medium">6. Data Retention</Text>
                        {"\n"}
                        Your Personal Information will be stored for the duration necessary for the purpose it was collected and processed, in accordance with
                        applicable laws.
                        {"\n"}
                        {"\n"}
                        <Text className="font-medium">7. Definition of Personal Information</Text>
                        {"\n"}
                        Personal Information refers to data that can identify you, including but not limited to:
                        {"\n"}- Name, marital status, birthdate, spouse’s name, and parents' names.
                        {"\n"}- Government-issued identifiers (e.g., social security numbers, licenses).
                        {"\n"}- Health records.
                        {"\n"}- Any classified information as mandated by law.
                        {"\n"}
                        {"\n"}
                        <Text className="font-medium">8. Conflict of Translations</Text>
                        {"\n"}
                        In case of any conflict between the English and vernacular translations of this document, the English version shall prevail.
                    </Text>
                    <View className="mt-6 space-y-4 mb-8">
                        <Text className="font-semibold text-xl mb-2">Agreement</Text>
                        <View className="flex-row space-x-4">
                            <TouchableOpacity
                                className={`flex-1 px-4 py-3 shadow-md border border-gray-300 ${
                                    agreement === true ? "bg-green-500 border-green-500" : "bg-white"
                                }`}
                                onPress={() => setAgreement(true)}
                            >
                                <Text className={`text-center text-lg ${agreement === true ? "font-semibold text-white" : "text-gray-700"}`}>
                                    Agree and Consent
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className={`flex-1 px-4 py-3 shadow-md border border-gray-300 ${
                                    agreement === false ? "bg-red-500 border-red-500" : "bg-white"
                                }`}
                                onPress={() => setAgreement(false)}
                            >
                                <Text className={`text-center text-lg ${agreement === false ? "font-semibold text-white" : "text-gray-700"}`}>
                                    Do Not Agree
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}
