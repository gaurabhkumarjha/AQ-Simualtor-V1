import { Text, Container, ActionIcon, Group, rem, Image } from '@mantine/core';
// import { IconBrandTwitter, IconBrandYoutube, IconBrandInstagram } from '@tabler/icons-react';
import UBLOGO from '../../Images/UELOGO.png';
import Twitter from '../../Images/twitter.png';
import Linkdin from '../../Images/linkedin.png';
import './Footer.css';

const data = [
    {

        title: 'Latest Research',
        links: [
            { label: 'Delhi Air Quality', link: 'https://urbanemissions.info/delhi-air-quality-forecasts/' },
            { label: 'India Air Quality', link: 'https://urbanemissions.info/india-air-quality-forecasts/' },
            { label: 'APnA City Program', link: 'https://urbanemissions.info/india-apna/' },
            { label: 'NCAP India', link: 'https://urbanemissions.info/india-air-quality/india-ncap-review/' },

        ],
    },
    {
        title: 'Publications',
        links: [
            { label: 'Journal Articles', link: 'https://urbanemissions.info/publications/#journalarticles/' },
            { label: 'Reports', link: 'https://urbanemissions.info/publications/#reports/' },
            { label: 'Working Papers', link: 'https://urbanemissions.info/publications/working-papers/' },
            { label: 'Reference Notes', link: 'https://urbanemissions.info/publications/#referencenotes/' },
            { label: 'Inforgraphs', link: 'https://urbanemissions.info/publications/infographs/' },
        ],
    },
    {
        title: 'Community',
        links: [
            { label: 'Linked IN', link: 'https://in.linkedin.com/in/sarath-guttikunda-3a01149' },
            { label: 'Follow on X', link: 'https://x.com/UrbanEmissions' },
        ],
    },
];

const groups = data.map((group) => {
    const links = group.links.map((link, index) => (
        <Text
            key={index}
            className={"link"}
            component="a"
            href={link.link}
        // onClick={(event) => event.preventDefault()}
        >
            {link.label}
        </Text>
    ));

    return (
        <div className={"wrapper"} key={group.title}>
            <Text className={"title"} fw={700}>{group.title}</Text>
            {links}
        </div>
    );
});

const Footer = () => {

    function Refertoaboutus() {
        window.location.href = "https://urbanemissions.info/about-ueinfo/";
    }

    return (

        <>
            <footer className={"footer"}>
                <Container className={"inner"}>
                    <div className={"logo"}>
                        <Image src={UBLOGO} alt='LOGo' onClick={Refertoaboutus} />
                        <Text size="xs" c="dimmed" className={"description"}>
                            UrbanEmissions.Info stands for (a) sharing knowledge on air pollution (b) science based air quality analysis (c) advocacy and awareness raising on air quality management and (d) building partnerships among local, national, and international air-heads.
                        </Text>
                    </div>
                    <div className={"groups"}>{groups}</div>
                </Container>
                <Container className={"afterFooter"}>
                    <Text c="dimmed" size="sm">
                        © 2024- {new Date().getFullYear()} Urban Emissions. All rights reserved.
                    </Text>

                    <Group gap={0} className={"social"} justify="flex-end" wrap="nowrap">
                        <ActionIcon size="lg" color="gray" variant="subtle">
                            <Image src={Linkdin} alt='Linkd in' style={{ width: rem(18), height: rem(18) }} />
                        </ActionIcon>
                        <ActionIcon size="lg" color="gray" variant="subtle">
                            <Image src={Twitter} alt='x' style={{ width: rem(18), height: rem(18) }} />
                        </ActionIcon>

                    </Group>
                </Container>
            </footer>
        </>
    )
}

export default Footer;    
