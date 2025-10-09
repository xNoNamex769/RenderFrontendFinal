import React from 'react'
import HeaderHome from '../src/pages/Home/HeaderHome'
import HeroHomeSection from '../src/pages/Home/HeroHomeSection'
import AboutComponent from "../src/pages/Home/AboutComponent"
import AnunciosHome from "../src/pages/Home/AnunciosHome"
import ProjectsHome from "../src/pages/Home/ProjectsHome"
import ContactHome from "../src/pages/Home/ContactHome"
import FooterHome from "../src/pages/Home/FooterHome"

import "../src/pages/Home/styles/HomeEstilosPrincipales.css"



export default function HomePage() {
  return (
    <>
        <HeaderHome></HeaderHome>
        <HeroHomeSection ></HeroHomeSection>
        <AboutComponent ></AboutComponent>
        <AnunciosHome></AnunciosHome>
        <ProjectsHome></ProjectsHome>
        <ContactHome></ContactHome>
        <FooterHome></FooterHome>
    </>
  )
}
