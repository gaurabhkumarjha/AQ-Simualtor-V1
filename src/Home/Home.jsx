import { Container, Text, Grid, Group, Button, Box, Input, Stack, Space, Drawer, Tooltip, Menu, Affix, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Card, message, notification, Alert } from 'antd';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import RefreshTwoToneIcon from '@mui/icons-material/RefreshTwoTone';
import LaunchIcon from '@mui/icons-material/Launch';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import JoditEditor from 'jodit-react';
import './Home.css';
import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import Footer from '../components/Footer/Footer';


var arr = []; // store the session storage data.
var uniqueValues = new Set();
const Home = () => {

    const [opened, { open, close }] = useDisclosure(false); // For Drawer
    const [openedModel, { open: Modalopen, close: Modalclose }] = useDisclosure(false); // for Clear zone Modal
    const [openedModelTwo, { open: ModalopenTwo, close: ModalcloseTwo }] = useDisclosure(false); // for Output Modal

    const [api, contextHolder] = notification.useNotification();
    const [zoneclickval, setzoneclickval] = useState(1);
    const [Blankedinput, setblankedinput] = useState(true);
    const [Showmenubar, setshowmenubar] = useState(true); // not show menu bar while click on output btn.
    const [Isvalueexist, setisvalueexist] = useState(false);
    const [Showaddzonebtn, setshowaddbtn] = useState(false);
    const [Showoutputbtn, setshowoutputbtn] = useState(false);
    const [NewZoneAvg, setNewZoneAvg] = useState(0.0); // For Store new zone avg;
    const [Totalpop, settotalpop] = useState(0.0); // Store sum of zone  population.
    const [Oldweightedavgconc, setoldweightedavgconc] = useState(0.0); // store old weighted avg conc. (Avg.conc * zone.pop)
    const [Popwtconc, setpopwtconc] = useState(0.0); // Store the pop.wt.conc.ug/m3 (Old weighted / Total.pop.mil);
    const [Newzoneweighted, setnewzoneweighted] = useState(0.0); // Store New zone weighted(new.zone.avg * zone.pop);
    const [Newpopweight, setnewpopweight] = useState(0.0); // Store New.pop.wt.conc (Newzone weighted / total.pop.mil);
    const [Netreduction, setnetreduction] = useState(0.0); // Store Net.reduction (pop.wt.conc / new.popwt.conc);

    const [input, setinput] = useState({
        Avgconc: "",
        Zonepop: "",
        Reduction: "",
    });
    const Inputonchange = (e) => {
        const { name, value } = e.target;
        setinput({ ...input, [name]: value });
    }

    const [content, setContent] = useState('');
    const [logs, setLogs] = useState([]);
    const editor = useRef(null); // Reference to Jodit Editor

    const appendLog = useCallback(
        (message) => {
            //console.log("logs = ", logs);
            const newLogs = [...logs, message];
            setLogs(newLogs);
        },
        [logs, setLogs]
    );

    const config = useMemo(
        () => ({
            readonly: false
        }),
        []
    );

    const onChange = useCallback(
        (newContent) => {
            appendLog(`onChange triggered with ${newContent}`);
        },
        [appendLog]
    );
    const onBlur = useCallback(
        (newContent) => {
            appendLog(`onBlur triggered with ${newContent}`);
            setContent(newContent);
        },
        [appendLog, setContent]
    );

    const ChangeZoneValue = () => { // Change the zone value function
        if (zoneclickval >= 10) {
            api['error']({
                message: 'Error',
                description:
                    'You exceed the zone value. The range of zone value is 1 to 10 if, you want to add new zone so, please contact to developer.',
            });
            return;
        }
        setzoneclickval(zoneclickval + 1);
        setinput({
            Avgconc: "",
            Zonepop: "",
            Reduction: "",
        })
        setshowaddbtn(false); // hide add btn
        setshowoutputbtn(false); // hide output btn
    }

    const CalculateValueANDSavein_session_storage = (e) => { // Main function calculate the value and save in session storage.
        e.preventDefault();
        const { Avgconc, Zonepop, Reduction } = input;

        if (Avgconc === "" || Zonepop === "" || Reduction === "") {
            message.error("All inputs are required");
            return;
        }

        setblankedinput(false);
        setshowmenubar(false);
        //ChangeZoneValue(); // Update the zone value when user clicks on calculate button (If, needed, then uncoment this line of code).

        // Parse input values to floats
        const parsedAvgconc = parseFloat(Avgconc);
        const parsedZonepop = parseFloat(Zonepop);
        const parsedReduction = parseFloat(Reduction);

        // Ensure parsing succeeded
        if (isNaN(parsedAvgconc) || isNaN(parsedZonepop) || isNaN(parsedReduction)) {
            message.error("All inputs must be valid numbers");
            return;
        }
        setshowoutputbtn(true); // show output btn

        const removePercentage = parsedReduction / 100; // Converting percentage into decimal. 40.0/100 == 0.4;
        const newZoneAvg = parsedAvgconc - (parsedAvgconc * removePercentage); // Formula to calculate New-zone-avg

        // Compute intermediate values
        const newTotalpop = parseFloat((Totalpop + parsedZonepop).toFixed(2));
        const newOldweightedavgconc = parseFloat((Oldweightedavgconc + (parsedAvgconc * parsedZonepop)).toFixed(2));
        const newPopwtconc = parseFloat((newOldweightedavgconc / newTotalpop).toFixed(2));
        const newNewzoneweighted = parseFloat((Newzoneweighted + (newZoneAvg * parsedZonepop)).toFixed(2));
        const newNewpopweight = parseFloat((newNewzoneweighted / newTotalpop).toFixed(2));
        const newNetreduction = parseFloat((((newPopwtconc - newNewpopweight) / newPopwtconc) * 100).toFixed(2));

        // Update state with new values
        setNewZoneAvg(newZoneAvg);
        settotalpop(newTotalpop);
        setoldweightedavgconc(newOldweightedavgconc);
        setpopwtconc(newPopwtconc);
        setnewzoneweighted(newNewzoneweighted);
        setnewpopweight(newNewpopweight);
        setnetreduction(newNetreduction);

        const zoneKey = `zone_${zoneclickval}`;
        sessionStorage.setItem(
            zoneKey,
            `For Zone:- ${zoneclickval} ---> AvgConc:- ${input.Avgconc}, ZonePop:- ${input.Zonepop}, Reduction:- ${input.Reduction}. Calculated Answer Is :-  New.Zone.Avg is:- ${newZoneAvg}, Total.Pop.Mil:- ${newTotalpop}, Pop.Wt.Conc:- ${newPopwtconc}, New.Pop.Wt.Conc:- ${newNewpopweight}, Net.Reduction:- ${newNetreduction}`
        );
        setshowaddbtn(true);
    };
    const GetAllZones = async () => { // Getting value from session storage.

        uniqueValues.clear() // clear all the value first...
        // Use a Set to store unique values
        for (let i = 1; i <= 10; i++) {
            const zoneKey = `zone_${i}`;
            const zoneValue = sessionStorage.getItem(zoneKey);
            if (zoneValue !== null) {
                uniqueValues.add(zoneValue);
            }
        }

        // Convert the Set to an array if needed
        arr = Array.from(uniqueValues);
        open()
    }
    const Clear_Session_Storage = async () => {// Clear session storage
        const zoneKey = `zone_${1}`;
        const IszoneValue = sessionStorage.getItem(zoneKey);

        if (IszoneValue !== null) {
            for (let i = 1; i <= 10; i++) {
                const zoneKey = `zone_${i}`;
                sessionStorage.removeItem(zoneKey);
            }
            // Convert the Set to an array if needed
        }
        setisvalueexist(false); // Hide prev zone btn.
        setshowaddbtn(false); // hide add btn
        setshowoutputbtn(false); // hide output btn
        setzoneclickval(1); // revert to zone 1
        Modalclose(); // close the modal
        message.success("All item's deleted");
        message.info(
            <span>
                Please try to hard refresh <RefreshTwoToneIcon />, for better result.
            </span>
        );
        return;
    }

    function Openoutputmodal() {
        setshowmenubar(true);
        ModalopenTwo();
    }
    useEffect(() => {
        const zoneKey = `zone_${1}`;
        const IszoneValue = sessionStorage.getItem(zoneKey);
        //console.log(zoneValue);
        if (IszoneValue !== null) {
            for (let i = 1; i <= 10; i++) {
                const zoneKey = `zone_${i}`;
                const zoneValue = sessionStorage.getItem(zoneKey);
                if (zoneValue !== null) {
                    uniqueValues.add(zoneValue);
                }
            }

            // Convert the Set to an array if needed
            arr = Array.from(uniqueValues);
            setisvalueexist(true);
        }
    }, [onChange, NewZoneAvg, Totalpop, Oldweightedavgconc, Popwtconc, Newzoneweighted, Newpopweight, Netreduction]);

    return (
        <>
            {contextHolder}
            <Text size="xl" style={{ textAlign: "center" }}>-- AQ Simualtor V1-- </Text>
            <Modal opened={openedModel} onClose={Modalclose} title="Are you sure want to clear all zone's records?" centered>
                <Text>Deleted item(s) never revert back. Zone Size:- {arr.length}</Text>
                <Group justify="flex-end">
                    <Button color='red' mt={'md'} onClick={Clear_Session_Storage}>Yes, Delete All</Button>
                </Group>

            </Modal>
            <Modal opened={openedModelTwo} onClose={ModalcloseTwo} title="Output Screen">
                <Stack align="stretch"
                    justify="center"
                    gap="md">
                    <Text size="md" tt="uppercase">Total population in (millions):- <Text c="teal.4">{Totalpop}</Text></Text>
                    <Text size="md" tt="uppercase">population weighted concentration in (ug/m3(micrograms per cubic meter)):- <Text c="teal.4">{Popwtconc}</Text></Text>
                    <Text size="md" tt="uppercase">New population weighted concentration:- <Text c="teal.4">{Newpopweight}</Text></Text>
                    <Text size="md" tt="uppercase">Net reduction:- <Text c="teal.4">{`${Netreduction} %`}</Text></Text>
                </Stack>
            </Modal>
            <Drawer opened={opened} onClose={close} title="Prev. Zone(s) Record's." offset={8} radius="md" position="right">
                {
                    arr.length ? arr.map((ele, idx) => {
                        return (
                            <>
                                <Text mb={'md'} key={idx}>
                                    {ele}
                                </Text>
                            </>
                        )
                    }) : "Nothing"

                }
                <Affix position={{ bottom: 20, right: 20 }}>
                    <Button variant='outline' color='red' onClick={Modalopen}>Clear all Prev Zone's</Button>
                </Affix>
            </Drawer>
            <Space h="xl" />
            <Container size={'lg'}>
                {/* <Center> */}
                <Card
                    bordered={false}
                    style={{
                        width: 'auto',
                        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                    }}
                >
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 6, lg: 6 }} >
                            <Card
                                bordered={false}
                                style={{
                                    boxShadow: "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
                                    marginTop: '23px'
                                }}
                            >
                                <Group justify="flex-end">
                                    {Showaddzonebtn && <Button variant="outline" color="teal" rightSection={<AddIcon />} onClick={ChangeZoneValue}>Add New Zone</Button>}
                                    {Isvalueexist && <Button variant="filled" color="indigo" rightSection={<LaunchIcon />} onClick={GetAllZones}>Prev Zone Input(s)</Button>}
                                </Group>
                                <Box mb={'md'}></Box>

                                <Stack align="stretch"
                                    justify="center"
                                    gap="md">
                                    <Text tt="uppercase" ta="center">Please Enter For Zone:- {zoneclickval}</Text>

                                    <Input variant="default" size="md" radius="xl" placeholder="Please enter Average Concentration (ug/m3)" name='Avgconc' value={input.Avgconc} onChange={Inputonchange} />
                                    <Input variant="default" size="md" radius="xl" placeholder="Please enter Zone Population (millions)" name='Zonepop' value={input.Zonepop} onChange={Inputonchange} />
                                    <Input variant="default" size="md" radius="xl" placeholder="Please enter Reduction (%)" name='Reduction' value={input.Reduction} onChange={Inputonchange} />

                                    <Menu width={500} shadow="md">
                                        <Menu.Target>
                                            <Group justify="space-between" grow>
                                                <Button variant="light" radius="md" color="teal" rightSection={<ArrowDropDownIcon />} onClick={CalculateValueANDSavein_session_storage}>Calculate</Button>

                                                {Showoutputbtn && <Button variant='subtle' radius="md" color="orange" onClick={Openoutputmodal}>Output</Button>}
                                            </Group>

                                        </Menu.Target>
                                        {
                                            Blankedinput === false && Showmenubar === false && <Menu.Dropdown>
                                                <Menu.Item>
                                                    <Stack align="stretch"
                                                        justify="center"
                                                        gap="md">
                                                        <Text size="xs">Toatl.pop.mil:- {Totalpop}</Text>
                                                        <Text size="xs">Pop.wt.conc.ug/m3:- {Popwtconc}</Text>
                                                        <Text size="xs">New.pop.wt.conc:- {Newpopweight}</Text>
                                                        <Text size="xs">Net.reduction:- {Netreduction}</Text>
                                                    </Stack>
                                                </Menu.Item>
                                            </Menu.Dropdown>
                                        }

                                    </Menu>
                                    <Input.Wrapper description="The new average concentration after applying the reduction">
                                        <Input variant="filled" size="md" radius="xl" value={`New Zone Average is:-  ${NewZoneAvg}`} disabled />
                                    </Input.Wrapper>

                                </Stack>
                            </Card>
                            <Alert
                                showIcon
                                message="Remember"
                                description="In the Reduction column, do not add '%'. Only enter numbers (e.g., 41.0, 40.0...)."
                                type="info"
                                style={{ marginTop: '20px' }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                            <Group justify="flex-end">
                                <Tooltip label="Text are not saved in any server." >
                                    <InfoIcon sx={{ color: 'black' }} />
                                </Tooltip>
                            </Group>

                            <JoditEditor
                                ref={editor}
                                value={content}
                                config={config}
                                tabIndex={1}
                                onBlur={onBlur}
                                onChange={onChange}
                            />
                        </Grid.Col>
                    </Grid>
                </Card>
                {/* </Center> */}
            </Container >
            <Box mt={'lg'}>
                <Footer />
            </Box>
        </>
    )
}


export default Home;