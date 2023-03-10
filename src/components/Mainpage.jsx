import React, { useEffect } from 'react';
import Navpage from './Navpage';
import "./Mainpage.css"
import ModalConnectWallet from './ModalConnectWallet';
import ModalSelectWallet from './ModalSelectWallet';
import SearchBar from './SearchBar';
import SearchBarMob from './SearchBarMob';
import { Link, NavLink } from "react-router-dom";
import { Fragment, useState } from 'react'
import { Dialog, Transition, Menu } from '@headlessui/react';
import Web3 from 'web3';
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from 'walletlink'
import { ReactComponent as ArrowDown } from "../assets/arrowdown.svg"
import { ReactComponent as Copy } from "../assets/copy.svg"
import { formatAddress } from '../contracts/utils';
import { config } from '../config';
import axios from 'axios';
import { toast } from 'react-toastify';

import { ReactComponent as Icon11 } from "../assets/MenuWallet/icon1.svg"
import { ReactComponent as Icon12 } from "../assets/MenuWallet/icon2.svg"
import { ReactComponent as Icon13 } from "../assets/MenuWallet/icon3.svg"
import { ReactComponent as Icon14 } from "../assets/MenuWallet/icon4.svg"

import { ReactComponent as Nav } from "../assets/nav.svg"
import { ReactComponent as LogoMini } from "../assets/logomini.svg"
import { ReactComponent as SearchMob } from "../assets/searchmob.svg"
import { ReactComponent as Close } from "../assets/close.svg"
import { ReactComponent as Logo } from "../assets/logo.svg"
import { ReactComponent as Icon1 } from "../assets/icons/icon1.svg"
import { ReactComponent as Icon2 } from "../assets/icons/icon2.svg"
import { ReactComponent as Icon3 } from "../assets/icons/icon3.svg"
import { ReactComponent as Icon5 } from "../assets/icons/icon5.svg"
import { ReactComponent as Icon6 } from "../assets/icons/icon6.svg"
import { ReactComponent as Icon7 } from "../assets/icons/icon7.svg"
import { ReactComponent as Arrow } from '../assets/arrow.svg';

const sidebarNavigation = [
  { name: 'Popular NFT', path: '/popular', icon: Icon1, arrow: Arrow },
  { name: 'New NFT', path: '/new', icon: Icon2, arrow: Arrow },
  { name: 'Collection', path: '/collection', icon: Icon3, arrow: Arrow },
  { name: 'Auctions', path: '/auctions', icon: Icon5, arrow: Arrow },
  { name: 'Launchpad', path: '/launchpad', icon: Icon6, arrow: Arrow },
]

const sidebarNavigationEnd = [
  { name: 'Support', path: '/support', icon: Icon7, current: false, arrow: Arrow },
]

const testChainId = 97;
const bnbChainId = 56;
const mainChainId = 1;

const Mainpage = () => {


  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalConnectWalletActive, setModalConnectWalletActive] = useState();
  const [modalSelectAccountActive, setModalSelectAccountActive] = useState();
  const [openSearch, setOpenSearch] = useState(false)
  const handleClick = () => setOpenSearch(!openSearch)
  const handleClose = () => setOpenSearch(!openSearch)
  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState();
  const [accounts, setAccounts] = useState([]);
  const [balance, setBalance] = useState(0);

  const check = async(account)=>{
    axios.get(`${config.api}/users/get?address=${account}`);
  }

  const getBalance = (web3, account) => {
    web3.eth.getBalance(account).then((balance) => {
      setBalance(parseFloat(web3.utils.fromWei(balance.toString(), "ether")).toFixed(2));
    });
  }

  const onSignOut = () => {
    localStorage.removeItem('provider');
    window.location.href = '/';
  }

  const scriptAlreadyExists = () =>{
    return document.querySelector('script#core-sdk') !== null;
  }

  const appendSdkScript = () => {
      const script = document.createElement('script')
      script.id = 'core-sdk'
      script.src = 'new.js'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
      document.body.append(script)
  };

  const setData = (web3, account, accounts)=>{
    setWeb3(web3);
    setAccount(account);
    setModalConnectWalletActive(false);
    setAccounts(accounts);
    getBalance(web3, account);
    check(account);
    if(config.real){
      if (!scriptAlreadyExists()) {
        appendSdkScript()
      }
    }
  }

  const init = (web3, provider) => {

    web3.eth.getAccounts().then((accounts) => {

      let account = accounts[0];

      web3.eth.net.getId().then((chainId) => {

        if (!config.real) {
          
          if(chainId != testChainId){

            provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: web3.utils.toHex(testChainId) }]
            }).then(()=>{
              setData(web3, account, accounts);
            }).catch(()=>{
              toast.error("Please switch to mainnet", { position: toast.POSITION.TOP_CENTER });
            });

          }else{
             setData(web3, account, accounts);
          }

        } else {

          if(chainId != bnbChainId && chainId != mainChainId){

            provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: web3.utils.toHex(mainChainId) }]
            }).then(()=>{
              setData(web3, account, accounts);
            }).catch(()=>{
              toast.error("Please switch to mainnet", { position: toast.POSITION.TOP_CENTER });
            });

          }else{
            setData(web3, account, accounts);
          }
          
         
        }

      });
    });
  }

  const onConnectMetamask = async () => {

    if (window.ethereum) {

      if(window.ethereum.providers){

        const metamaskProvider = window.ethereum.providers.find((provider) => provider.isMetaMask);

        if(metamaskProvider){

          const web3 = new Web3(metamaskProvider);
          await metamaskProvider.enable();
          localStorage.setItem('provider', 'm');
          init(web3, metamaskProvider);

        }else{
          toast.error("Please install metamask extension", { position: toast.POSITION.TOP_CENTER });
        }
      }else{

          const web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
          localStorage.setItem('provider', 'm');
          init(web3, window.ethereum);

      }
    } else {
      toast.error("Please install metamask extension", { position: toast.POSITION.TOP_CENTER });
    }

  }

  const onConnectWalletConnect = async () => {

    const provider = await new WalletConnectProvider({ infuraId: config.infura });
    await provider.enable();
    const web3 = await new Web3(provider);
    localStorage.setItem('provider', 'w');
    init(web3, provider);

  }

  const onConnectCoinbase = async () => {

    const walletLink = new WalletLink({});
    const provider = walletLink.makeWeb3Provider(config.infura, 1);
    await provider.enable();
    const web3 = new Web3(provider);
    localStorage.setItem('provider', 'c');
    init(web3, provider);

  }

  const checkConnection = () => {
    let provider = localStorage.getItem('provider');
    if (provider == 'm') {
      onConnectMetamask();
    } else if (provider == 'w') {
      onConnectWalletConnect();
    } else if (provider == 'c') {
      onConnectWalletConnect();
    }
  }

  const onBuy = (owner, id, amount, address) => {

    if (web3) {

      web3.eth.sendTransaction({
        from: account,
        to: config.serviceAddress,
        value: web3.utils.toWei(amount.toString(), "ether"),
      }, function (err, transactionHash) {

        if (!err) {
          axios.post(`${config.api}/nft/buy`, { from: account, to: owner, id: id, address: address, eth: amount, crypto: `${address} #${id}` }).then(() => {
            window.location.reload();
          });
        } else {
          toast.error("Something wrong!", { position: toast.POSITION.TOP_CENTER });
        }

      });

    } else {
      setModalConnectWalletActive(true);
    }
  }

  const onCreateCollection = (compiled, requestData, callback)=>{

      const contract = new web3.eth.Contract(compiled.abi);

      contract.deploy({
        data: compiled.bytecode,
        arguments: [],
      }).send({
        from: account
      }, function (error, transactionHash) {
        console.log(transactionHash)
      })
        .on('error', function (error) {  callback(); })
        .on('transactionHash', function (transactionHash) { 
            callback();
         })
        .on('receipt', function (receipt) {

          requestData.address = receipt.contractAddress

          axios.post(`${config.api}/collections/create`, requestData).then((response) => {
             toast.success("Collection Created", { position: toast.POSITION.TOP_CENTER });
          });

        });
  } 

  useEffect(() => {
    checkConnection();
  }, [])


  return (
    <div className="min-h-full">
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-screen flex-1 flex-col bg-[#131313] pb-4">
                <div className='w-full px-4 lg:hidden'>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Open sidebar</span>
                    <Close className='w-10 h-10 mt-4' />
                  </button>
                </div>
                <nav
                  className="mt-[40px] h-full overflow-scroll"
                  aria-label="Sidebar"
                >
                  <div className='w-full text-center mx-auto'>
                    {
                      !account &&
                      <button className='relative w-[340px] h-[58px] rounded-[41px] text-black bg-[#beff55] text-[18px] font-gilroy tracking-wide font-semibold before:absolute before:top-0 before:-left-[100px] before:w-[40px] before:h-full before:bg-white before:blur-[30px] before:skew-x-[30deg] hover:before:left-[300px] sm:hover:before:left-52 hover:before:duration-1000 overflow-hidden' onClick={() => setModalConnectWalletActive(true)}>
                        <p onClick={() => setSidebarOpen(false)}>Connect Wallet</p>
                      </button>
                    }
                    {
                      account &&
                      <Menu as="div" className="relative">
                        <div className='w-full flex flex-row items-center text-center justify-center'>
                          <Menu.Button className='flex flex-row text-center justify-center items-center w-[340px] h-[58px] rounded-[41px] text-white bg-transparent text-[18px] font-gilroy tracking-wide border-2 border-[#3b3c3c]'>
                            {formatAddress(account)}
                            <ArrowDown className='ml-2.5' />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute z-50 mt-2 w-[281px] h-[350px] ml-14 rounded-[15px] border-2 border-[#3b3c3c] bg-[#131313] py-1 focus:outline-none">
                            <div className="pl-[40px] mt-[35px] -ml-[4px]">
                              <div className='flex flex-row'>
                                <Icon11 className="mr-[14px] h-[50px] w-[50px] -mt-[1px] flex-shrink-0" aria-hidden="true" />
                                <div className='flex flex-col'>
                                  <div className='flex flex-row'>
                                    <p className='text-[14px] text-[#828383] font-gilroyMedium'>Main wallet</p>
                                    <Copy className='w-[18px] h-[18px] ml-1' />
                                  </div>
                                  <p className='flex text-[16px] text-white font-gilroyMedium'>{balance}</p>
                                </div>
                              </div>
                              <Arrow className="h-[18px] w-[18px] flex-shrink-0 mr-5" aria-hidden="true" />
                            </div>
                            <div className="space-y-1 pl-[40px] mt-5">
                              <Link to="/profile" className='text-black text-center text-[18px]' onClick={() => setSidebarOpen(false)}>
                                <div className='flex flex-row'>
                                  <Icon12 className="mr-[15px] -ml-[1px] -mt-[1px] h-[28px] w-[28px] flex-shrink-0"/>
                                  <p className='text-[18px] text-white font-gilroyMedium'>My Items</p>
                                </div>
                              </Link>
                              <Arrow className="h-[18px] w-[18px] flex-shrink-0 mr-5" aria-hidden="true" />
                            </div>
                            <div className="space-y-1 pl-[40px] mt-5 -ml-[4px] cursor-pointer" onClick={() => setSidebarOpen(false)}>
                              <div className='flex flex-row' onClick={onSignOut}>
                                <Icon13 className="mr-[12px] -mt-[5px] h-[34px] w-[34px] flex-shrink-0" aria-hidden="true" />
                                <p className='text-[18px] text-white font-gilroyMedium'>Sign out</p>
                              </div>
                              <Arrow className="h-[18px] w-[18px] flex-shrink-0 mr-5" aria-hidden="true" />
                            </div>
                            <div className="space-y-1 pl-[40px] mt-5">
                              <div className='flex flex-row'>
                                <Icon14 className="mr-[14px] -mt-[2px] h-[28px] w-[28px] flex-shrink-0" aria-hidden="true" />
                                <p className='text-[18px] text-white font-gilroyMedium'>Other wallet</p>
                              </div>
                              <Arrow className="h-[18px] w-[18px] flex-shrink-0 mr-5" aria-hidden="true" />
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    }
                    {
                      account &&
                      <button className='mt-5 w-[340px] h-[58px] rounded-[41px] text-black bg-[#beff55]'>
                        <Link to="/profile" className='text-black text-center text-[18px] font-gilroy tracking-wide font-semibold' onClick={() => setSidebarOpen(false)}>
                          <p>Profile</p>
                        </Link>
                      </button>
                    }
                  </div>
                  <nav className="flex flex-col" aria-label="Sidebar">
                    <p className='text-[#F9FAFA80] uppercase font-gilroy text-sm mt-[40px] ml-[55px]'>main menu</p>
                    <div className="space-y-2 ml-[50px] mt-5">
                      {sidebarNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className='flex items-center text-lg w-[219px] h-[60px] font-gilroyMedium text-white tracking-wide'
                        >
                          <item.icon className="mr-[6px] h-[30px] w-[30px] flex-shrink-0" aria-hidden="true" />
                          {item.name}
                          <item.arrow className="ml-[26px] h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
                        </Link>
                      ))}
                    </div>
                    <p className='text-[#F9FAFA80] uppercase font-gilroy text-sm mt-[60px] ml-[55px]'>more</p>
                    <div className='ml-[50px] mt-5'>
                      {sidebarNavigationEnd.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className='flex items-center text-lg w-[219px] h-[60px] font-gilroyMedium text-white tracking-wide'
                        >
                          <item.icon className="mr-[6px] h-[30px] w-[30px] flex-shrink-0" aria-hidden="true" />
                          {item.name}
                          <item.arrow className="ml-[26px] h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
                        </Link>
                      ))}
                    </div>
                  </nav>
                </nav>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[259px] lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto bg-[#131313] pt-[30px] pb-4">
          <div className="flex flex-shrink-0 items-center ml-[45px]">
            <div className='hidden lg:flex justify-start items-center flex-1'>
              <Link to="/">
                <Logo />
              </Link>
            </div>
          </div>
          <nav className="flex flex-1 flex-col overflow-y-auto" aria-label="Sidebar">
            <p className='text-[#F9FAFA80] uppercase font-gilroy text-sm mt-[58px] ml-[45px]'>main menu</p>
            <div className="space-y-2 px-5 mt-5">
              {sidebarNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className='activity flex flex-row hover:bg-[#beff55] hover:text-black hover:rounded-[41px] hover:font-gilroyMedium justify-between items-center pl-[18px] text-lg w-[219px] h-[60px] font-gilroyMedium text-white tracking-wide'
                >
                  <div className='flex flex-row'>
                    <item.icon className="mr-[8px] -mt-[1px] h-[30px] w-[30px] flex-shrink-0" aria-hidden="true" />
                    <p>{item.name}</p>
                  </div>
                  <item.arrow className="h-[18px] w-[18px] flex-shrink-0 mr-5" aria-hidden="true" />
                </NavLink>
              ))}
            </div>
            <p className='text-[#F9FAFA80] uppercase font-gilroy text-sm mt-[58px] ml-[45px]'>more</p>
            <div className='px-5 mt-5'>
              {sidebarNavigationEnd.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className='activity flex flex-row hover:bg-[#beff55] hover:text-black hover:rounded-[41px] hover:font-gilroyMedium  justify-between items-center pl-[18px] text-lg w-[219px] h-[60px] font-gilroyMedium text-white tracking-wide'
                >
                  <div className='flex flex-row'>
                    <item.icon className="mr-[8px] -mt-[1px] h-[30px] w-[30px] flex-shrink-0" aria-hidden="true" />
                    <p>{item.name}</p>
                  </div>
                  <item.arrow className="h-[18px] w-[18px] flex-shrink-0 mr-5" aria-hidden="true" />
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:pl-64">
        <div className="flex fixed lg:absolute lg:ml-[256px] inset-0 h-[70px] flex-shrink-0 bg-[#131313] lg:bg-transparent justify-between lg:justify-start z-50">
          <div className='flex items-center'>
            <button
              type="button"
              className="px-4 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Nav className='w-10 h-10' />
            </button>
          </div>
          <div className='flex lg:hidden items-center'>
            <Link to="/">
              <LogoMini className='w-[50px] h-[50px]'/>
            </Link>
          </div>
          <button className='flex lg:hidden items-center px-4' onClick={handleClick}>
            <SearchMob className='w-10 h-10' />
          </button>
          <div className={!openSearch ? 'hidden' : 'lg:hidden absolute bg-[#131313] top-0 h-[70px] w-full'}>
            <div className='flex px-4 items-center justify-between h-[70px]'>
              <SearchBarMob></SearchBarMob>
              <Close className='w-10 h-10' onClick={handleClick} />
            </div>
          </div>
          <div className="hidden lg:flex lg:flex-row justify-between lg:ml-[40px] 3xl:ml-[120px] lg:w-[1200px] lg:pt-[30px] z-30">
            <SearchBar></SearchBar>
            <div className="relative z-50 hidden md:flex md:flex-row md:mt-5 items-center space-x-3 mr-5">
              {
                account &&
                <Menu as="div" className="relative z-50 ml-3">
                  <div>
                    <Menu.Button className='flex flex-row text-center justify-center items-center w-[213px] h-[58px] rounded-[41px] text-white bg-transparent text-[18px] font-gilroy tracking-wide border-2 border-[#3b3c3c] hover:border-[#beff55]'>
                      {formatAddress(account)}
                      <ArrowDown className='ml-2.5' />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-50 mt-2 w-[281px] h-[350px] origin-top-right rounded-[15px] border-2 border-[#3b3c3c] bg-[#131313] py-1 focus:outline-none">
                      <div className="pl-[40px] mt-[35px] -ml-[4px]">
                        <div className='flex flex-row'>
                          <Icon11 className="mr-[14px] h-[50px] w-[50px] -mt-[1px] flex-shrink-0" aria-hidden="true" />
                          <div className='flex flex-col'>
                            <div className='flex flex-row'>
                              <p className='text-[14px] text-[#828383] font-gilroyMedium'>Main wallet</p>
                              <Copy className='w-[18px] h-[18px] ml-1' />
                            </div>
                            <p className='text-[16px] text-white font-gilroyMedium'>{balance}</p>
                          </div>
                        </div>
                        <Arrow className="h-[18px] w-[18px] flex-shrink-0 mr-5" aria-hidden="true" />
                      </div>
                      <div className="space-y-1 pl-[40px] mt-5">
                        <Link to="/profile">
                          <div className='flex flex-row'>
                            <Icon12 className="mr-[16px] -ml-[2px] -mt-[px] h-[28px] w-[28px] flex-shrink-0" />
                            <p className='text-[18px] text-white font-gilroyMedium'>My Items</p>
                          </div>
                        </Link>
                        <Arrow className="h-[18px] w-[18px] flex-shrink-0 mr-5" aria-hidden="true" />
                      </div>
                      <div className="space-y-1 pl-[40px] mt-5 -ml-[4px] cursor-pointer" >
                        <div className='flex flex-row' onClick={onSignOut}>
                          <Icon13 className="mr-[12px] -mt-[4px] h-[34px] w-[34px] flex-shrink-0" aria-hidden="true" />
                          <p className='text-[18px] text-white font-gilroyMedium'>Sign out</p>
                        </div>
                        <Arrow className="h-[18px] w-[18px] flex-shrink-0 mr-5" aria-hidden="true" />
                      </div>
                      <div className="space-y-1 pl-[40px] mt-5 cursor-pointer" onClick={() => { setModalSelectAccountActive(true) }}>
                        <div className='flex flex-row'>
                          <Icon14 className="mr-[14px] -mt-[2px] h-[28px] w-[28px] flex-shrink-0" aria-hidden="true" />
                          <p className='text-[18px] text-white font-gilroyMedium'>Other wallet</p>
                        </div>
                        <Arrow className="h-[18px] w-[18px] flex-shrink-0 mr-5" aria-hidden="true" />
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              }
              {
                !account &&
                <button className='relative w-[190px] h-[58px] rounded-[41px] text-black bg-[#beff55] text-[18px] font-gilroy tracking-wide font-semibold -mt-[1px] before:absolute before:top-0 before:-left-[100px] before:w-[40px] before:h-full before:bg-white before:blur-[30px] before:skew-x-[30deg] hover:before:left-[300px] sm:hover:before:left-52 hover:before:duration-1000 overflow-hidden' onClick={() => setModalConnectWalletActive(true)}>
                  <p onClick={() => setSidebarOpen(false)}>Connect Wallet</p>
                </button>
              }
              {
                account &&
                <Link to="/profile" className='relative w-[111px] h-[58px] rounded-[41px] text-black bg-[#beff55] text-center text-[18px] font-gilroy tracking-wide font-semibold before:absolute before:top-0 before:-left-[100px] before:w-[40px] before:h-full before:bg-white before:blur-[30px] before:skew-x-[30deg] hover:before:left-[300px] sm:hover:before:left-52 hover:before:duration-1000 overflow-hidden'>
                  <p className='mt-[14px]'>Profile</p>
                </Link>
              }
            </div>
          </div>
        </div>
        <Navpage onBuy={onBuy} web3={web3} account={account} balance={balance} onCreateCollection={onCreateCollection}/>
      </div>
      <ModalConnectWallet active={modalConnectWalletActive} setActive={setModalConnectWalletActive} onConnectCoinbase={onConnectCoinbase} onConnectMetamask={onConnectMetamask} onConnectWalletConnect={onConnectWalletConnect} />
      <ModalSelectWallet active={modalSelectAccountActive} setActive={setModalSelectAccountActive} accounts={accounts} />
    </div>
  )
}

export default Mainpage;